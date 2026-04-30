import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import { users as usersApi } from "../../services/api";
import {
  initials as initialsOf,
  avatarColor,
  fullName,
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

  // Redirige si non-admin
  useEffect(() => {
    if (user && user.admin !== true) {
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
      setCreateStatus({ type: "success", message: "Membre ajouté — mot de passe par défaut : « poker »" });
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

  return (
    <div className="admin-page">
      <Navbar />

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Console d'administration</h1>
          <p className="admin-description">
            Gérez les membres du club. La saisie des scores se fait directement
            depuis la page de chaque session.
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
                          {p.admin === true ? " · Admin" : ""}
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
