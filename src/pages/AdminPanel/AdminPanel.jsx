import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import { users as usersApi, evenements, tournois, scores } from "../../services/api";
import {
  initials as initialsOf,
  avatarColor,
  fullName,
  formatDateShort,
} from "../../utils/format";
import "./AdminPanel.css";

function AdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [newPlayer, setNewPlayer] = useState({ nom: "", prenom: "", mail: "", pseudo: "" });
  const [createStatus, setCreateStatus] = useState(null);

  const [eventsList, setEventsList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [sessionResults, setSessionResults] = useState([
    { utilisateurid: "", score: "", bonus: "" },
    { utilisateurid: "", score: "", bonus: "" },
    { utilisateurid: "", score: "", bonus: "" },
  ]);
  const [sessionStatus, setSessionStatus] = useState(null);

  // Redirige si non-admin
  useEffect(() => {
    if (user && user.admin !== "Oui") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const refreshPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const list = await usersApi.list();
      setPlayers(list || []);
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    refreshPlayers();
    evenements.recent(10).then(setEventsList).catch(() => setEventsList([]));
  }, []);

  const filteredPlayers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => {
      const s = [p.prenom, p.nom, p.pseudo, p.mail].filter(Boolean).join(" ").toLowerCase();
      return s.includes(q);
    });
  }, [players, searchTerm]);

  const handleNewPlayerSubmit = async (e) => {
    e.preventDefault();
    setCreateStatus(null);
    if (!newPlayer.nom || !newPlayer.prenom) {
      setCreateStatus({ type: "error", message: "Nom et prénom requis" });
      return;
    }
    try {
      await usersApi.create(newPlayer);
      setCreateStatus({ type: "success", message: "Membre ajouté" });
      setNewPlayer({ nom: "", prenom: "", mail: "", pseudo: "" });
      refreshPlayers();
    } catch (err) {
      setCreateStatus({ type: "error", message: err.message || "Erreur" });
    }
  };

  const handleDeletePlayer = async (id) => {
    if (!confirm("Supprimer ce membre ? Cette action est irréversible.")) return;
    try {
      await usersApi.remove(id);
      refreshPlayers();
    } catch (err) {
      alert("Erreur : " + (err.message || "impossible de supprimer"));
    }
  };

  const updateResultRow = (index, patch) => {
    setSessionResults((rows) =>
      rows.map((r, i) => (i === index ? { ...r, ...patch } : r))
    );
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setSessionStatus(null);
    if (!selectedEvent) {
      setSessionStatus({ type: "error", message: "Choisissez une session" });
      return;
    }
    const ev = eventsList.find((x) => String(x.id) === String(selectedEvent));
    if (!ev) {
      setSessionStatus({ type: "error", message: "Session introuvable" });
      return;
    }
    try {
      const valid = sessionResults.filter(
        (r) => r.utilisateurid && r.score !== ""
      );
      if (valid.length === 0) {
        setSessionStatus({ type: "error", message: "Renseignez au moins un résultat" });
        return;
      }
      for (let i = 0; i < valid.length; i++) {
        const r = valid[i];
        await scores.create({
          utilisateurid: Number(r.utilisateurid),
          evenementid: ev.id,
          tournoiid: ev.id_tournoi,
          points: Number(r.score) || 0,
          bonus: Number(r.bonus) || 0,
          score: (Number(r.score) || 0) + (Number(r.bonus) || 0),
          position_sortie: i + 1,
          repas: "non",
        });
      }
      setSessionStatus({ type: "success", message: "Résultats enregistrés" });
      setSessionResults([
        { utilisateurid: "", score: "", bonus: "" },
        { utilisateurid: "", score: "", bonus: "" },
        { utilisateurid: "", score: "", bonus: "" },
      ]);
    } catch (err) {
      setSessionStatus({ type: "error", message: err.message || "Erreur" });
    }
  };

  return (
    <div className="admin-page">
      <Navbar />

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Console d'administration</h1>
          <p className="admin-description">
            Gérez les membres du club et enregistrez les résultats des sessions.
          </p>
        </header>

        <div className="admin-grid">
          <div className="admin-left">
            <section className="admin-section">
              <div className="grain-texture"></div>
              <div className="admin-section-header">
                <span
                  className="material-symbols-outlined admin-section-icon"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  person_add
                </span>
                <h2 className="admin-section-title">Ajouter un membre</h2>
              </div>
              <form className="admin-form" onSubmit={handleNewPlayerSubmit}>
                <div className="admin-form-row">
                  <Input
                    label="Prénom"
                    type="text"
                    placeholder="ex. Julien"
                    value={newPlayer.prenom}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, prenom: e.target.value })
                    }
                  />
                  <Input
                    label="Nom"
                    type="text"
                    placeholder="ex. Martin"
                    value={newPlayer.nom}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, nom: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-row">
                  <Input
                    label="Pseudo"
                    type="text"
                    placeholder="ex. jmartin"
                    value={newPlayer.pseudo}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, pseudo: e.target.value })
                    }
                  />
                  <Input
                    label="Adresse e-mail"
                    type="email"
                    placeholder="julien@exemple.fr"
                    value={newPlayer.mail}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, mail: e.target.value })
                    }
                  />
                </div>
                {createStatus && (
                  <p
                    style={{
                      color: createStatus.type === "error" ? "#e57373" : "#88d4cc",
                      fontSize: "0.875rem",
                      margin: 0,
                    }}
                  >
                    {createStatus.message}
                  </p>
                )}
                <div className="admin-form-actions">
                  <Button type="submit">Ajouter le membre</Button>
                </div>
              </form>
            </section>

            <section className="admin-section">
              <div className="grain-texture"></div>
              <div className="admin-section-header-with-date">
                <div className="admin-section-header">
                  <span
                    className="material-symbols-outlined admin-section-icon admin-section-icon-tertiary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    history_edu
                  </span>
                  <h2 className="admin-section-title">Saisir des résultats</h2>
                </div>
              </div>

              <form className="admin-session-form" onSubmit={handleSessionSubmit}>
                <div className="admin-form-row" style={{ marginBottom: "1rem" }}>
                  <div className="input-group">
                    <label className="input-label">Session</label>
                    <div className="input-wrapper">
                      <select
                        className="admin-session-select"
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option value="">-- choisir une session --</option>
                        {eventsList.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {formatDateShort(ev.date)} — {ev.tournoi_nom || "Session"}
                            {ev.lieu_nom ? ` (${ev.lieu_nom})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="admin-session-entries">
                  {sessionResults.map((result, index) => (
                    <div key={index} className="admin-session-entry">
                      <div className="admin-session-rank">
                        <span
                          className={`admin-session-rank-badge ${index === 0 ? "admin-session-rank-badge-first" : ""}`}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="admin-session-player">
                        <select
                          className="admin-session-select"
                          value={result.utilisateurid}
                          onChange={(e) =>
                            updateResultRow(index, { utilisateurid: e.target.value })
                          }
                        >
                          <option value="">Choisir un joueur…</option>
                          {players.map((p) => (
                            <option key={p.id} value={p.id}>
                              {fullName(p) || p.pseudo || `#${p.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-session-points">
                        <input
                          type="number"
                          placeholder="Points"
                          className="admin-session-input"
                          value={result.score}
                          onChange={(e) =>
                            updateResultRow(index, { score: e.target.value })
                          }
                        />
                        <span className="admin-session-pts">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    type="button"
                    className="leaderboard-view-more"
                    onClick={() =>
                      setSessionResults((r) => [
                        ...r,
                        { utilisateurid: "", score: "", bonus: "" },
                      ])
                    }
                  >
                    + Ajouter un joueur
                  </button>
                </div>

                {sessionStatus && (
                  <p
                    style={{
                      color: sessionStatus.type === "error" ? "#e57373" : "#88d4cc",
                      fontSize: "0.875rem",
                      margin: "0.5rem 0",
                    }}
                  >
                    {sessionStatus.message}
                  </p>
                )}

                <div className="admin-session-actions">
                  <Button variant="secondary">Enregistrer les résultats</Button>
                </div>
              </form>
            </section>
          </div>

          <div className="admin-right">
            <section className="admin-players">
              <div className="grain-texture"></div>
              <div className="admin-players-header">
                <div className="admin-section-header">
                  <span
                    className="material-symbols-outlined admin-section-icon admin-section-icon-secondary"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    groups
                  </span>
                  <h2 className="admin-section-title">Gestion des membres</h2>
                </div>
                <div className="admin-search">
                  <span className="material-symbols-outlined admin-search-icon">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
              </div>

              <div className="admin-players-list">
                {loadingPlayers && (
                  <div className="admin-player-item">
                    <p style={{ opacity: 0.7 }}>Chargement…</p>
                  </div>
                )}
                {!loadingPlayers && filteredPlayers.length === 0 && (
                  <div className="admin-player-item">
                    <p style={{ opacity: 0.7 }}>Aucun membre trouvé</p>
                  </div>
                )}
                {filteredPlayers.slice(0, 50).map((p) => (
                  <div key={p.id} className="admin-player-item">
                    <div className="admin-player-info">
                      <div
                        className="admin-player-avatar"
                        style={{ backgroundColor: avatarColor(p.id) }}
                      >
                        <span>{initialsOf(p)}</span>
                      </div>
                      <div>
                        <h3 className="admin-player-name">
                          {fullName(p) || p.pseudo || `#${p.id}`}
                        </h3>
                        <p className="admin-player-joined">
                          {p.pseudo ? `@${p.pseudo}` : p.mail || "—"}
                          {p.admin === "Oui" ? " · Admin" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="admin-player-actions">
                      <button
                        className="admin-player-action admin-player-action-delete"
                        title="Supprimer"
                        onClick={() => handleDeletePlayer(p.id)}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {filteredPlayers.length > 50 && (
                  <p style={{ opacity: 0.6, textAlign: "center", padding: "0.5rem" }}>
                    Affichage limité à 50 membres — affinez votre recherche
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default AdminPanel;
