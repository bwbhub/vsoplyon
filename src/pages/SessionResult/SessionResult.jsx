import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import { evenements, scores, participations, lieux as lieuxApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ScoreEntry from "../../components/ScoreEntry/ScoreEntry";
import {
  formatDateLong,
  formatPoints,
  initials as initialsOf,
  avatarColor,
  fullName,
} from "../../utils/format";
import "./SessionResult.css";

function SessionResult() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: me } = useAuth();
  const isAdmin = me?.admin === true;

  const [event, setEvent] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [rsvp, setRsvp] = useState({ count: 0, mine: false, loading: false });
  const [rsvpParticipants, setRsvpParticipants] = useState([]);
  const [rsvpListOpen, setRsvpListOpen] = useState(false);
  const [rsvpListHovered, setRsvpListHovered] = useState(false);

  // Modes admin : edition des metadonnees + saisie des scores
  const [editingMeta, setEditingMeta] = useState(false);
  const [enteringScores, setEnteringScores] = useState(false);
  const [editedMeta, setEditedMeta] = useState({ date: "", lieu_id: "", type: "normal", annulation: false });
  const [editStatus, setEditStatus] = useState(null);
  const [lieuxList, setLieuxList] = useState([]);

  // Recharge la session apres saisie de scores ou edition
  const reloadEvent = async () => {
    try {
      const [ev, rows, part] = await Promise.all([
        evenements.get(id),
        scores.byEvenement(id),
        participations.byEvenement(id).catch(() => null),
      ]);
      setEvent(ev);
      setRankings(rows || []);
      if (part) {
        setRsvp({ count: part.count, mine: part.mine, loading: false });
        setRsvpParticipants(part.participants || []);
      }
    } catch { /* silencieux */ }
  };

  // Charge les lieux quand on passe en mode edition
  useEffect(() => {
    if (!editingMeta || lieuxList.length > 0) return;
    lieuxApi.list().then(setLieuxList).catch(() => setLieuxList([]));
  }, [editingMeta, lieuxList.length]);

  // Initialise le formulaire d'edition avec les valeurs courantes
  const openEdit = () => {
    if (!event) return;
    // Format datetime-local : "YYYY-MM-DDTHH:MM"
    const d = new Date(event.date);
    const pad = (n) => String(n).padStart(2, "0");
    const dt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setEditedMeta({
      date: dt,
      lieu_id: event.lieu_id ? String(event.lieu_id) : "",
      type: event.type || "normal",
      annulation: event.annulation === true || event.annulation === "oui",
    });
    setEditStatus(null);
    setEditingMeta(true);
  };

  const saveEdit = async () => {
    setEditStatus(null);
    try {
      const payload = {
        date: new Date(editedMeta.date).toISOString(),
        lieu_id: editedMeta.lieu_id ? Number(editedMeta.lieu_id) : null,
        type: editedMeta.type,
        annulation: editedMeta.annulation,
      };
      await evenements.update(id, payload);
      setEditingMeta(false);
      await reloadEvent();
    } catch (err) {
      setEditStatus({ type: "error", message: err.message || "Erreur" });
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [ev, rows, part] = await Promise.all([
          evenements.get(id),
          scores.byEvenement(id),
          participations.byEvenement(id).catch(() => null),
        ]);
        if (!alive) return;
        setEvent(ev);
        setRankings(rows || []);
        if (part) {
          setRsvp({ count: part.count, mine: part.mine, loading: false });
          setRsvpParticipants(part.participants || []);
        }
      } catch (err) {
        if (alive) setError(err.message || "Erreur de chargement");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const toggleRsvp = async () => {
    if (rsvp.loading) return;
    setRsvp((p) => ({ ...p, loading: true }));
    try {
      if (rsvp.mine) {
        await participations.leave(id);
        setRsvp((p) => ({ count: Math.max(0, p.count - 1), mine: false, loading: false }));
      } else {
        await participations.join(id);
        setRsvp((p) => ({ count: p.count + 1, mine: true, loading: false }));
      }
    } catch {
      setRsvp((p) => ({ ...p, loading: false }));
    }
  };

  const isPast = event ? new Date(event.date).getTime() < Date.now() : false;
  const isCancelled = event?.annulation === true || event?.annulation === "oui";
  const hasResults = rankings.length > 0;
  // RSVP ouvert tant que la session n'est ni cloturee (scores saisis) ni annulee.
  // L'heure passee n'est plus un critere : on peut s'inscrire tant que la session
  // est "active" du point de vue admin.
  const rsvpOpen = !hasResults && !isCancelled;

  const rsvpListVisible = rsvpListOpen || rsvpListHovered;

  const totalPoints = rankings.reduce(
    (sum, r) => sum + (Number(r.score) || 0),
    0
  );
  const mvp = rankings[0];
  // Totaux des mains remarquables (sans indiquer qui a eu quoi)
  const totalCarres = rankings.reduce((s, r) => s + (Number(r.carre) || 0), 0);
  const totalRoyalFlush = rankings.reduce((s, r) => s + (Number(r.royal_flush) || 0), 0);
  const totalFlush = rankings.reduce((s, r) => s + (Number(r.flush) || 0), 0);
  const bountyHunter = rankings.find((r) => r.bounty === true);
  const INITIAL_VISIBLE = 5;
  const visible = showAll ? rankings : rankings.slice(0, INITIAL_VISIBLE);

  return (
    <div className="session-result-page">
      <Navbar />

      <main className="session-result-main">
        <div className="session-result-back">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Retour au tableau de bord</span>
          </button>
        </div>

        {loading && <p style={{ opacity: 0.7 }}>Chargement de la session…</p>}
        {error && (
          <p style={{ color: "#e57373" }}>Impossible de charger la session : {error}</p>
        )}

        {/* ===== Mode saisie de scores : remplace tout le contenu ===== */}
        {event && enteringScores && isAdmin && (
          <ScoreEntry
            event={event}
            existingScores={hasResults ? rankings : []}
            onCancel={() => setEnteringScores(false)}
            onSaved={async () => {
              setEnteringScores(false);
              await reloadEvent();
            }}
          />
        )}

        {/* ===== Toolbar admin (mode normal) ===== */}
        {event && !enteringScores && isAdmin && !editingMeta && (
          <div className="session-admin-toolbar">
            <button
              type="button"
              className="session-admin-btn"
              onClick={openEdit}
            >
              <span className="material-symbols-outlined">edit</span>
              Modifier la session
            </button>
            <button
              type="button"
              className={`session-admin-btn ${!hasResults ? "session-admin-btn-primary" : ""}`}
              onClick={() => setEnteringScores(true)}
              disabled={isCancelled}
              title={isCancelled ? "Session annulée" : ""}
            >
              <span className="material-symbols-outlined">
                {hasResults ? "edit_note" : "history_edu"}
              </span>
              {hasResults ? "Modifier les scores" : "Saisir les scores"}
            </button>
          </div>
        )}

        {/* ===== Formulaire d'edition des metadonnees ===== */}
        {event && editingMeta && isAdmin && (
          <div className="session-edit-form">
            <h2 className="session-edit-title">Modifier la session</h2>
            <div className="session-edit-grid">
              <label className="session-edit-field">
                <span>Date et heure</span>
                <input
                  type="datetime-local"
                  value={editedMeta.date}
                  onChange={(e) => setEditedMeta((m) => ({ ...m, date: e.target.value }))}
                />
              </label>
              <label className="session-edit-field">
                <span>Lieu</span>
                <select
                  value={editedMeta.lieu_id}
                  onChange={(e) => setEditedMeta((m) => ({ ...m, lieu_id: e.target.value }))}
                >
                  <option value="">— aucun —</option>
                  {lieuxList.map((l) => (
                    <option key={l.id} value={l.id}>{l.nom}</option>
                  ))}
                </select>
              </label>
              <label className="session-edit-field">
                <span>Type</span>
                <select
                  value={editedMeta.type}
                  onChange={(e) => setEditedMeta((m) => ({ ...m, type: e.target.value }))}
                >
                  <option value="normal">Normale</option>
                  <option value="finale">🏆 Grande finale</option>
                </select>
              </label>
              <label className="session-edit-field session-edit-checkbox">
                <input
                  type="checkbox"
                  checked={editedMeta.annulation}
                  onChange={(e) => setEditedMeta((m) => ({ ...m, annulation: e.target.checked }))}
                />
                <span>Session annulée</span>
              </label>
            </div>
            {editStatus && <p className="session-edit-error">{editStatus.message}</p>}
            <div className="session-edit-actions">
              <button
                type="button"
                className="score-entry-btn-secondary"
                onClick={() => setEditingMeta(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="score-entry-btn-primary"
                onClick={saveEdit}
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {event && !enteringScores && (
          <>
            <div className="session-result-header">
              <div>
                <span className="session-result-date">
                  {formatDateLong(event.date)}
                </span>
                <h1 className="session-result-title">
                  {event.tournoi_nom || "Session"}
                  {event.lieu_nom ? ` — ${event.lieu_nom}` : ""}
                </h1>
              </div>
              {isCancelled ? (
                <div className="session-result-status">
                  <div className="session-result-status-text">
                    <span className="session-result-status-label">Statut</span>
                    <span className="session-result-status-value">Annulée</span>
                  </div>
                  <span
                    className="material-symbols-outlined session-result-status-icon"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    cancel
                  </span>
                </div>
              ) : !rsvpOpen ? (
                <div className="session-result-status">
                  <div className="session-result-status-text">
                    <span className="session-result-status-label">Inscrits</span>
                    <span className="session-result-status-value">
                      {rsvp.count} joueur{rsvp.count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <span
                    className="material-symbols-outlined session-result-status-icon"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    group
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className={`session-result-rsvp ${rsvp.mine ? "session-result-rsvp-active" : ""}`}
                  onClick={toggleRsvp}
                  disabled={rsvp.loading}
                >
                  <div className="session-result-rsvp-text">
                    <span className="session-result-rsvp-label">
                      {rsvp.count} inscrit{rsvp.count > 1 ? "s" : ""}
                    </span>
                    <span className="session-result-rsvp-value">
                      {rsvp.mine ? "✓ Tu participes" : "Je viens"}
                    </span>
                  </div>
                  <span
                    className="material-symbols-outlined session-result-rsvp-icon"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {rsvp.mine ? "check_circle" : "add_circle"}
                  </span>
                </button>
              )}
            </div>

            <div className="session-insights">
              <div className="session-insight-primary">
                <div>
                  <span className="session-insight-label">MVP</span>
                  <h3 className="session-insight-title">
                    Vainqueur de la session
                  </h3>
                </div>
                {mvp ? (
                  <div className="session-insight-mvp">
                    <div
                      className="session-insight-avatar"
                      style={{
                        backgroundColor: avatarColor(mvp.utilisateur_id),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                      }}
                    >
                      {initialsOf(mvp)}
                    </div>
                    <div>
                      <p className="session-insight-mvp-name">
                        {fullName(mvp)}
                        {mvp.pseudo ? ` « ${mvp.pseudo} »` : ""}
                      </p>
                      <p className="session-insight-mvp-desc">
                        {formatPoints(mvp.score)} points remportés
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ opacity: 0.7 }}>Aucun résultat enregistré</p>
                )}
                <div className="session-insight-glow"></div>
              </div>

              <div className="session-insights-secondary">
                <div className="session-insight-card">
                  <div>
                    <span className="session-insight-card-label">
                      Joueurs présents
                    </span>
                    <div className="session-insight-card-value">
                      {rankings.length}
                    </div>
                  </div>
                  <span className="material-symbols-outlined session-insight-card-icon">
                    groups
                  </span>
                </div>

                <div
                  className="rsvp-tile-wrapper"
                  onMouseEnter={() => setRsvpListHovered(true)}
                  onMouseLeave={() => setRsvpListHovered(false)}
                >
                  <button
                    type="button"
                    className="session-insight-card session-insight-card-interactive"
                    onClick={() => setRsvpListOpen((v) => !v)}
                  >
                    <div>
                      <span className="session-insight-card-label">
                        Joueurs inscrits
                      </span>
                      <div className="session-insight-card-value">
                        {rsvp.count}
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined session-insight-card-icon"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      how_to_reg
                    </span>
                  </button>

                  {rsvpListVisible && (
                    <div
                      className="rsvp-participants-popup"
                      onMouseEnter={() => setRsvpListHovered(true)}
                      onMouseLeave={() => setRsvpListHovered(false)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="rsvp-participants-header">
                        <span className="rsvp-participants-title">
                          Inscrits ({rsvp.count})
                        </span>
                        <button
                          type="button"
                          className="rsvp-participants-close"
                          onClick={() => { setRsvpListOpen(false); setRsvpListHovered(false); }}
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                      <div className="rsvp-participants-list">
                        {rsvpParticipants.length === 0 ? (
                          <p className="rsvp-participants-empty">Aucun joueur inscrit</p>
                        ) : (
                          rsvpParticipants.map((p) => (
                            <div key={p.id} className="rsvp-participants-row">
                              <button
                                type="button"
                                className="rsvp-participants-link"
                                onClick={() => {
                                  setRsvpListOpen(false);
                                  setRsvpListHovered(false);
                                  navigate(`/profile/${p.id}`);
                                }}
                              >
                                <div
                                  className="rsvp-participants-avatar"
                                  style={{ backgroundColor: avatarColor(p.id) }}
                                >
                                  {initialsOf(p)}
                                </div>
                                <div>
                                  <span className="rsvp-participants-name">{fullName(p)}</span>
                                  {p.pseudo && (
                                    <span className="rsvp-participants-pseudo">{p.pseudo}</span>
                                  )}
                                </div>
                              </button>
                              {isAdmin && (
                                <button
                                  type="button"
                                  className="rsvp-participants-remove"
                                  title="Retirer cette inscription"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm(`Retirer l'inscription de ${fullName(p)} ?`)) return;
                                    try {
                                      await participations.remove(id, p.id);
                                      setRsvpParticipants((list) => list.filter((x) => x.id !== p.id));
                                      setRsvp((r) => ({
                                        ...r,
                                        count: Math.max(0, r.count - 1),
                                        mine: r.mine && Number(p.id) !== Number(me?.id) ? r.mine : false,
                                      }));
                                    } catch (err) {
                                      alert("Erreur : " + (err.message || "impossible"));
                                    }
                                  }}
                                >
                                  <span className="material-symbols-outlined">person_remove</span>
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="session-insight-card">
                  <div>
                    <span className="session-insight-card-label">
                      Points distribués
                    </span>
                    <div className="session-insight-card-value session-insight-card-value-primary">
                      {formatPoints(totalPoints)}
                      <span className="session-insight-card-unit">PTS</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined session-insight-card-icon session-insight-card-icon-primary">
                    database
                  </span>
                </div>

                {/* Mains remarquables — totaux sans nominer les joueurs */}
                {hasResults && (
                  <div className="session-insight-card session-insight-hands">
                    <div>
                      <span className="session-insight-card-label">
                        Mains remarquables
                      </span>
                      <div className="session-hands-totals">
                        <span className="session-hands-item" title="Carrés">
                          <span className="session-hands-tag">C</span>
                          {totalCarres}
                        </span>
                        <span className="session-hands-item" title="Royal flush">
                          <span className="session-hands-tag">RF</span>
                          {totalRoyalFlush}
                        </span>
                        <span className="session-hands-item" title="Flush">
                          <span className="session-hands-tag">F</span>
                          {totalFlush}
                        </span>
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined session-insight-card-icon"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      playing_cards
                    </span>
                  </div>
                )}

                {/* Bounty Hunter de la session */}
                {bountyHunter && (
                  <div
                    className="session-insight-card session-insight-bounty"
                    onClick={() => navigate(`/profile/${bountyHunter.utilisateur_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <span className="session-insight-card-label">
                        Bounty hunter
                      </span>
                      <div className="session-insight-bounty-player">
                        <div
                          className="session-insight-avatar"
                          style={{
                            backgroundColor: avatarColor(bountyHunter.utilisateur_id),
                            width: "2.25rem",
                            height: "2.25rem",
                            fontSize: "0.8rem",
                          }}
                        >
                          {initialsOf(bountyHunter)}
                        </div>
                        <div className="session-insight-bounty-info">
                          <span className="session-insight-bounty-name">
                            {fullName(bountyHunter)}
                          </span>
                          <span className="session-insight-bounty-kills">
                            {bountyHunter.kills} kill{bountyHunter.kills > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined session-insight-card-icon"
                      style={{ fontVariationSettings: '"FILL" 1', color: "#ffc845" }}
                    >
                      military_tech
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="session-rankings">
              <div className="session-rankings-header">
                <h2 className="session-rankings-title">Classement de la session</h2>
                <div className="session-rankings-badges">
                  <span className="session-rankings-badge session-rankings-badge-active">
                    Points
                  </span>
                  {event.tournoi_nom && (
                    <span className="session-rankings-badge">
                      {event.tournoi_nom}
                    </span>
                  )}
                </div>
              </div>

              <div className="session-rankings-table">
                <div className="session-rankings-table-header">
                  <div className="session-rankings-col-rank">Rang</div>
                  <div className="session-rankings-col-player">Joueur</div>
                  <div className="session-rankings-col-points">Points</div>
                </div>

                <div className="session-rankings-list">
                  {visible.map((player, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={player.id}
                        className={`session-ranking-row ${rank === 1 ? "session-ranking-row-winner" : ""}`}
                        onClick={() => navigate(`/profile/${player.utilisateur_id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="session-ranking-rank">
                          <div
                            className={`session-ranking-rank-badge ${rank === 1 ? "session-ranking-rank-badge-winner" : ""}`}
                          >
                            {rank}
                          </div>
                        </div>
                        <div className="session-ranking-player">
                          <div
                            className="session-ranking-avatar-placeholder"
                            style={{
                              backgroundColor: avatarColor(player.utilisateur_id),
                              color: "var(--on-surface)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 600,
                            }}
                          >
                            {initialsOf(player)}
                          </div>
                          <div>
                            <span className="session-ranking-name">
                              {fullName(player)}
                            </span>
                            {player.pseudo && (
                              <span className="session-ranking-nickname">
                                {player.pseudo}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="session-ranking-points">
                          <span
                            className={`session-ranking-points-value ${rank === 1 ? "session-ranking-points-value-winner" : ""}`}
                          >
                            {formatPoints(player.score)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {rankings.length > INITIAL_VISIBLE && (
                  <div className="session-rankings-footer">
                    <button
                      className="session-rankings-show-more"
                      onClick={() => setShowAll((v) => !v)}
                    >
                      {showAll
                        ? "Réduire la liste"
                        : `+ Afficher ${rankings.length - INITIAL_VISIBLE} joueurs de plus`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {rsvpListOpen && (
        <div
          className="rsvp-participants-backdrop"
          onClick={() => setRsvpListOpen(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

export default SessionResult;
