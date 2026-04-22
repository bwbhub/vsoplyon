import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import { evenements, scores } from "../../services/api";
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

  const [event, setEvent] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [ev, rows] = await Promise.all([
          evenements.get(id),
          scores.byEvenement(id),
        ]);
        if (!alive) return;
        setEvent(ev);
        setRankings(rows || []);
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

  const totalPoints = rankings.reduce(
    (sum, r) => sum + (Number(r.score) || 0),
    0
  );
  const mvp = rankings[0];
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

        {event && (
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
              <div className="session-result-status">
                <div className="session-result-status-text">
                  <span className="session-result-status-label">Statut</span>
                  <span className="session-result-status-value">
                    {event.annulation === "oui" ? "Annulée" : "Validée"}
                  </span>
                </div>
                <span
                  className="material-symbols-outlined session-result-status-icon"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {event.annulation === "oui" ? "cancel" : "verified"}
                </span>
              </div>
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
                        backgroundColor: avatarColor(mvp.utilisateurid),
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
                              backgroundColor: avatarColor(player.utilisateurid),
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

      <BottomNav />
    </div>
  );
}

export default SessionResult;
