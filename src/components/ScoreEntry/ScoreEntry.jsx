import { useEffect, useMemo, useState } from "react";
import { users as usersApi, participations, scores } from "../../services/api";
import {
  initials as initialsOf,
  avatarColor,
  fullName,
} from "../../utils/format";
import "./ScoreEntry.css";

/**
 * Workflow de saisie des scores d'une session, en deux etapes :
 *
 *   1. Verification des inscrits : on affiche les joueurs ayant fait RSVP
 *      et l'admin peut en ajouter (pour les retardataires) ou en retirer.
 *
 *   2. Saisie du classement :
 *      - Desktop : split-view (gauche = cards joueurs cliquables ; droite = N
 *        emplacements de classement, autant que d'inscrits).
 *      - Mobile  : liste verticale d'emplacements avec un selecteur stylise
 *        de joueurs sur chaque ligne.
 *
 * Regle de points : (N - rang + 1) + kills + 5 pts bonus pour le 1er.
 *
 * Props :
 *   - event           : { id, tournoi_id, type }
 *   - existingScores  : tableau des scores deja saisis (pour edition) ou []
 *   - onCancel        : callback quand l'admin annule
 *   - onSaved         : callback quand les scores sont enregistres
 */
function ScoreEntry({ event, existingScores = [], onCancel, onSaved }) {
  const isEdit = existingScores.length > 0;

  const [step, setStep] = useState("inscrits"); // "inscrits" | "ranking"
  const [allPlayers, setAllPlayers] = useState([]);
  const [participants, setParticipants] = useState([]); // joueurs inscrits/ajoutes
  const [search, setSearch] = useState("");
  const [showAddPicker, setShowAddPicker] = useState(false);

  // Etat du classement : ranking[i] = utilisateur_id (ou null) ; killsByUser = { [uid]: nb }
  const [ranking, setRanking] = useState([]);
  const [killsByUser, setKillsByUser] = useState({});
  // Mains remarquables par joueur : { [uid]: { carre, royal_flush, flush } }
  const [handsByUser, setHandsByUser] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ----- Chargement initial : RSVP + tous les joueurs -----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [rsvp, allUsers] = await Promise.all([
          participations.byEvenement(event.id).catch(() => ({ participants: [] })),
          usersApi.list(),
        ]);
        if (!alive) return;
        setAllPlayers(allUsers || []);

        if (isEdit) {
          // En edition : on initialise depuis les scores existants
          const sorted = [...existingScores].sort(
            (a, b) => (a.position_sortie || 99) - (b.position_sortie || 99)
          );
          setParticipants(
            sorted.map((s) => ({
              id: s.utilisateur_id,
              nom: s.nom,
              prenom: s.prenom,
              pseudo: s.pseudo,
            }))
          );
          setRanking(sorted.map((s) => s.utilisateur_id));
          setKillsByUser(
            Object.fromEntries(sorted.map((s) => [s.utilisateur_id, s.kills || 0]))
          );
          setHandsByUser(
            Object.fromEntries(sorted.map((s) => [s.utilisateur_id, {
              carre: s.carre || 0,
              royal_flush: s.royal_flush || 0,
              flush: s.flush || 0,
            }]))
          );
          setStep("ranking");
        } else {
          setParticipants(rsvp.participants || []);
        }
      } catch (err) {
        setError(err.message || "Erreur de chargement");
      }
    })();
    return () => { alive = false; };
  }, [event?.id]);

  // Liste des joueurs encore non-classes (pour les cartes a cliquer)
  const unranked = useMemo(
    () => participants.filter((p) => !ranking.includes(p.id)),
    [participants, ranking]
  );

  // ----- Etape 1 : inscrits -----
  const filteredAddable = useMemo(() => {
    const known = new Set(participants.map((p) => p.id));
    const q = search.trim().toLowerCase();
    return allPlayers
      .filter((p) => !known.has(p.id))
      .filter((p) => {
        if (!q) return true;
        const s = [p.nom, p.prenom, p.pseudo, p.mail]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return s.includes(q);
      })
      .slice(0, 30);
  }, [allPlayers, participants, search]);

  const addParticipant = async (player) => {
    setParticipants((list) => [...list, player]);
    setSearch("");
    // Inscrit aussi cote serveur (idempotent) — silencieux en cas d'echec
    try {
      // POST /participations cree pour l'admin lui-meme dans la version actuelle.
      // Pour ajouter qq d'autre, on utiliserait un endpoint dedie. Pour le moment
      // on se contente du stockage local cote workflow : les scores seront
      // saisis directement, pas besoin de RSVP en bdd.
    } catch { /* silencieux */ }
  };

  const removeParticipant = (uid) => {
    setParticipants((list) => list.filter((p) => p.id !== uid));
    setRanking((r) => r.filter((x) => x !== uid));
    setKillsByUser(({ [uid]: _drop, ...rest }) => rest);
  };

  const goToRanking = () => {
    if (participants.length === 0) {
      setError("Ajoutez au moins un participant");
      return;
    }
    setError(null);
    // Initialise un ranking vide de la bonne taille (ou conserve l'existant)
    if (ranking.length !== participants.length) {
      setRanking(Array(participants.length).fill(null));
    }
    setStep("ranking");
  };

  // ----- Etape 2 : ranking -----
  const placeNext = (uid) => {
    setRanking((r) => {
      const idx = r.findIndex((x) => x === null);
      if (idx === -1) return r;
      const next = [...r];
      next[idx] = uid;
      return next;
    });
  };

  const setSlot = (idx, uid) => {
    setRanking((r) => {
      const next = [...r];
      // Si ce joueur etait deja place ailleurs, on libere son ancien emplacement
      const prev = next.indexOf(uid);
      if (prev !== -1) next[prev] = null;
      next[idx] = uid || null;
      return next;
    });
  };

  const clearSlot = (idx) => {
    setRanking((r) => {
      const next = [...r];
      next[idx] = null;
      return next;
    });
  };

  const setKills = (uid, val) => {
    setKillsByUser((k) => ({ ...k, [uid]: Number(val) || 0 }));
  };

  const setHand = (uid, field, val) => {
    setHandsByUser((h) => ({
      ...h,
      [uid]: { ...(h[uid] || { carre: 0, royal_flush: 0, flush: 0 }), [field]: Number(val) || 0 },
    }));
  };

  const allFilled = ranking.length > 0 && ranking.every((x) => x !== null);

  // Le bounty va au joueur avec le plus de kills. En cas d'egalite, au mieux
  // classe (= plus bas position_sortie = plus haut dans ranking[]).
  const bountyWinnerId = useMemo(() => {
    if (!allFilled) return null;
    let best = null;
    let bestKills = 0;
    for (let i = 0; i < ranking.length; i++) {
      const uid = ranking[i];
      const k = killsByUser[uid] || 0;
      if (k > bestKills) { best = uid; bestKills = k; }
    }
    return bestKills > 0 ? best : null;
  }, [ranking, killsByUser, allFilled]);

  const computePoints = (rankIndex, total, kills) => {
    const rankPoints = total - rankIndex;
    const killPoints = Number(kills) || 0;
    const bonus = rankIndex === 0 ? 5 : 0;
    return rankPoints + killPoints + bonus;
  };

  const submit = async () => {
    if (!allFilled) {
      setError("Le classement n'est pas complet");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Si edition, on efface tous les anciens scores avant de re-saisir
      if (isEdit) await scores.clearByEvenement(event.id);

      const total = ranking.length;
      for (let i = 0; i < total; i++) {
        const uid = ranking[i];
        const kills = killsByUser[uid] || 0;
        const hands = handsByUser[uid] || { carre: 0, royal_flush: 0, flush: 0 };
        const bonus = i === 0 ? 5 : 0;
        const rankPoints = total - i;
        const points = rankPoints + kills + bonus;
        await scores.create({
          utilisateur_id: uid,
          evenement_id: event.id,
          tournoi_id: event.tournoi_id,
          points,
          bonus,
          kills,
          score: points,
          position_sortie: i + 1,
          repas: "non",
          carre: hands.carre,
          royal_flush: hands.royal_flush,
          flush: hands.flush,
          bounty: uid === bountyWinnerId,
        });
      }
      onSaved?.();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
      setSubmitting(false);
    }
  };

  // ----- Render -----
  if (step === "inscrits") {
    return (
      <div className="score-entry">
        <header className="score-entry-header">
          <h2 className="score-entry-title">
            Etape 1 / 2 — Verification des inscrits
          </h2>
          <p className="score-entry-subtitle">
            {participants.length} joueur{participants.length > 1 ? "s" : ""} inscrit
            {participants.length > 1 ? "s" : ""}. Ajoutez les retardataires si besoin
            avant de saisir le classement.
          </p>
        </header>

        <div className="score-entry-participants">
          {participants.length === 0 && (
            <p className="score-entry-empty">Aucun joueur pour l'instant</p>
          )}
          {participants.map((p) => (
            <div key={p.id} className="score-entry-participant">
              <div
                className="score-entry-avatar"
                style={{ backgroundColor: avatarColor(p.id) }}
              >
                {initialsOf(p)}
              </div>
              <div className="score-entry-participant-info">
                <span className="score-entry-participant-name">{fullName(p)}</span>
                {p.pseudo && (
                  <span className="score-entry-participant-pseudo">@{p.pseudo}</span>
                )}
              </div>
              <button
                type="button"
                className="score-entry-remove-btn"
                onClick={() => removeParticipant(p.id)}
                title="Retirer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ))}
        </div>

        <div className="score-entry-add">
          {!showAddPicker ? (
            <button
              type="button"
              className="score-entry-add-toggle"
              onClick={() => setShowAddPicker(true)}
            >
              <span className="material-symbols-outlined">person_add</span>
              Ajouter un joueur
            </button>
          ) : (
            <div className="score-entry-add-picker">
              <div className="score-entry-add-search">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Rechercher un membre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="score-entry-add-close"
                  onClick={() => { setShowAddPicker(false); setSearch(""); }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="score-entry-add-list">
                {filteredAddable.length === 0 && (
                  <p className="score-entry-empty">Aucun resultat</p>
                )}
                {filteredAddable.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="score-entry-add-row"
                    onClick={() => addParticipant(p)}
                  >
                    <div
                      className="score-entry-avatar score-entry-avatar-sm"
                      style={{ backgroundColor: avatarColor(p.id) }}
                    >
                      {initialsOf(p)}
                    </div>
                    <span>{fullName(p)}</span>
                    {p.pseudo && (
                      <span className="score-entry-add-row-pseudo">@{p.pseudo}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="score-entry-error">{error}</p>}

        <div className="score-entry-actions">
          <button type="button" className="score-entry-btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button
            type="button"
            className="score-entry-btn-primary"
            onClick={goToRanking}
            disabled={participants.length === 0}
          >
            Passer au classement →
          </button>
        </div>
      </div>
    );
  }

  // step === "ranking"
  return (
    <div className="score-entry">
      <header className="score-entry-header">
        <h2 className="score-entry-title">
          Etape 2 / 2 — Saisie du classement
        </h2>
        <p className="score-entry-subtitle">
          {participants.length} emplacement{participants.length > 1 ? "s" : ""}.
          {" "}Sur desktop, cliquez une carte joueur pour la placer au prochain rang
          libre. Sur mobile, choisissez un joueur dans le selecteur de chaque ligne.
        </p>
      </header>

      <div className="score-entry-split">
        {/* Cartes joueurs (desktop seulement) */}
        <aside className="score-entry-pool">
          <h3 className="score-entry-pool-title">
            A placer ({unranked.length})
          </h3>
          <div className="score-entry-pool-list">
            {unranked.map((p) => (
              <button
                key={p.id}
                type="button"
                className="score-entry-pool-card"
                onClick={() => placeNext(p.id)}
              >
                <div
                  className="score-entry-avatar"
                  style={{ backgroundColor: avatarColor(p.id) }}
                >
                  {initialsOf(p)}
                </div>
                <span className="score-entry-pool-name">{fullName(p)}</span>
              </button>
            ))}
            {unranked.length === 0 && (
              <p className="score-entry-empty">Tous les joueurs sont places</p>
            )}
          </div>
        </aside>

        {/* Slots de classement */}
        <div className="score-entry-slots">
          {ranking.map((uid, idx) => {
            const player = participants.find((p) => p.id === uid);
            const total = ranking.length;
            const kills = killsByUser[uid] || 0;
            const points = uid != null ? computePoints(idx, total, kills) : 0;
            return (
              <div
                key={idx}
                className={`score-entry-slot ${idx === 0 ? "score-entry-slot-first" : ""} ${uid != null ? "score-entry-slot-filled" : ""}`}
              >
                <div className="score-entry-slot-rank">{idx + 1}</div>

                {/* Joueur place */}
                {player ? (
                  <div className="score-entry-slot-player">
                    <div
                      className="score-entry-avatar"
                      style={{ backgroundColor: avatarColor(player.id) }}
                    >
                      {initialsOf(player)}
                    </div>
                    <span className="score-entry-slot-name">{fullName(player)}</span>
                    <button
                      type="button"
                      className="score-entry-slot-clear"
                      onClick={() => clearSlot(idx)}
                      title="Retirer du classement"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ) : (
                  /* Selecteur (utilise sur mobile principalement) */
                  <select
                    className="score-entry-slot-select"
                    value=""
                    onChange={(e) => setSlot(idx, Number(e.target.value))}
                  >
                    <option value="">Choisir un joueur...</option>
                    {participants
                      .filter((p) => !ranking.includes(p.id) || p.id === uid)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {fullName(p)}
                        </option>
                      ))}
                  </select>
                )}

                {/* Kills + mains remarquables + points calcules */}
                {uid != null && (
                  <div className="score-entry-slot-meta">
                    <label
                      className="score-entry-chip score-entry-chip-kills"
                      title="Kills"
                    >
                      <span className="material-symbols-outlined">local_fire_department</span>
                      <input
                        type="number"
                        min="0"
                        value={killsByUser[uid] ?? 0}
                        onChange={(e) => setKills(uid, e.target.value)}
                      />
                    </label>
                    <label className="score-entry-chip score-entry-chip-hand" title="Carré">
                      <span className="score-entry-chip-tag">C</span>
                      <input
                        type="number"
                        min="0"
                        value={handsByUser[uid]?.carre ?? 0}
                        onChange={(e) => setHand(uid, "carre", e.target.value)}
                      />
                    </label>
                    <label className="score-entry-chip score-entry-chip-hand" title="Royal flush">
                      <span className="score-entry-chip-tag">RF</span>
                      <input
                        type="number"
                        min="0"
                        value={handsByUser[uid]?.royal_flush ?? 0}
                        onChange={(e) => setHand(uid, "royal_flush", e.target.value)}
                      />
                    </label>
                    <label className="score-entry-chip score-entry-chip-hand" title="Flush">
                      <span className="score-entry-chip-tag">F</span>
                      <input
                        type="number"
                        min="0"
                        value={handsByUser[uid]?.flush ?? 0}
                        onChange={(e) => setHand(uid, "flush", e.target.value)}
                      />
                    </label>
                    {uid === bountyWinnerId && (
                      <span
                        className="score-entry-chip score-entry-chip-bounty"
                        title="Bounty hunter (plus de kills)"
                      >
                        <span className="material-symbols-outlined">military_tech</span>
                        Bounty
                      </span>
                    )}
                    <span className="score-entry-slot-points">{points} PTS</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="score-entry-error">{error}</p>}

      <div className="score-entry-actions">
        <button
          type="button"
          className="score-entry-btn-secondary"
          onClick={() => setStep("inscrits")}
        >
          ← Retour aux inscrits
        </button>
        <button
          type="button"
          className="score-entry-btn-primary"
          onClick={submit}
          disabled={!allFilled || submitting}
        >
          {submitting ? "Enregistrement..." : isEdit ? "Mettre a jour" : "Valider la session"}
        </button>
      </div>
    </div>
  );
}

export default ScoreEntry;
