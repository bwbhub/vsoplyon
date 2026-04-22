import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import { evenements, scores, tournois, leaderboard } from "../../services/api";
import {
  formatDateLong,
  formatDateShort,
  formatPoints,
  avatarColor,
  initials as initialsOf,
} from "../../utils/format";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [upcoming, setUpcoming] = useState(null);
  const [recent, setRecent] = useState([]);
  const [currentTournoi, setCurrentTournoi] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [up, rec, tList] = await Promise.all([
          evenements.upcoming(1),
          evenements.recent(3),
          tournois.list(),
        ]);
        if (!alive) return;
        setUpcoming(up?.[0] || null);

        // Pour chaque session recente, recuperer le gagnant (score le plus haut)
        const recentWithWinners = await Promise.all(
          (rec || []).map(async (ev) => {
            try {
              const rows = await scores.byEvenement(ev.id);
              return { ...ev, winner: rows?.[0] || null };
            } catch {
              return { ...ev, winner: null };
            }
          })
        );
        if (!alive) return;
        setRecent(recentWithWinners);

        // Tournoi courant = le plus recent (tri DESC cote API)
        const current = tList?.[0] || null;
        setCurrentTournoi(current);

        if (current && user?.id) {
          const board = await leaderboard.byTournoi(current.id, 500);
          if (!alive) return;
          setTotalPlayers(board.length);
          const idx = board.findIndex((p) => Number(p.id) === Number(user.id));
          if (idx >= 0) {
            setMyRank(idx + 1);
            setMyPoints(Number(board[idx].total) || 0);
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <p className="dashboard-label">Tableau de bord</p>
          <h1 className="dashboard-title">
            Bienvenue, {user?.prenom || user?.pseudo || "joueur"}.
          </h1>
        </header>

        <div className="dashboard-grid">
          <section className="next-session">
            <div className="grain-texture"></div>
            <div className="next-session-content">
              <div className="next-session-info">
                <div className="next-session-badge">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    event_upcoming
                  </span>
                  <span className="next-session-badge-text">
                    Prochaine session
                  </span>
                </div>
                <h2 className="next-session-title">
                  {upcoming
                    ? (upcoming.tournoi_nom || "Session")
                    : loading
                      ? "Chargement..."
                      : "Aucune session à venir"}
                </h2>
                {upcoming && (
                  <div className="next-session-details">
                    <div className="next-session-detail">
                      <span className="material-symbols-outlined">
                        calendar_today
                      </span>
                      <span>{formatDateLong(upcoming.date)}</span>
                    </div>
                    {upcoming.lieu_nom && (
                      <div className="next-session-detail">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                        <span>{upcoming.lieu_nom}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="next-session-actions">
                {upcoming && (
                  <Button onClick={() => navigate(`/session/${upcoming.id}`)}>
                    Voir la session
                  </Button>
                )}
              </div>
            </div>
          </section>

          <aside className="season-rank">
            <div className="grain-texture"></div>
            <div className="season-rank-content">
              <p className="season-rank-label">
                {currentTournoi ? currentTournoi.nom : "Saison en cours"}
              </p>
              <div className="season-rank-position">
                <p className="season-rank-subtitle">Votre position</p>
                <div className="season-rank-number">
                  <span className="season-rank-hash">
                    {myRank ? `#${myRank}` : "—"}
                  </span>
                  {totalPlayers > 0 && (
                    <span className="season-rank-total">sur {totalPlayers}</span>
                  )}
                </div>
              </div>
              <div className="season-rank-stats">
                <div className="season-rank-progress">
                  <div className="season-rank-progress-header">
                    <span>Points saison</span>
                    <span className="season-rank-points">
                      {formatPoints(myPoints)} PTS
                    </span>
                  </div>
                  <div className="season-rank-bar">
                    <div
                      className="season-rank-bar-fill"
                      style={{
                        width: totalPlayers
                          ? `${Math.max(
                              4,
                              Math.round(
                                ((totalPlayers - (myRank || totalPlayers) + 1) /
                                  totalPlayers) *
                                  100
                              )
                            )}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                  {myRank && myRank > 1 ? (
                    <p className="season-rank-progress-text">
                      Encore {myRank - 1} place{myRank - 1 > 1 ? "s" : ""} avant
                      le podium
                    </p>
                  ) : (
                    <p className="season-rank-progress-text">
                      {myRank === 1 ? "Vous dominez la saison" : "Participez à une session pour marquer des points"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section className="recent-sessions">
            <div className="recent-sessions-header">
              <div>
                <p className="recent-sessions-label">Archive</p>
                <h3 className="recent-sessions-title">Sessions récentes</h3>
              </div>
              <button
                className="recent-sessions-view-all"
                onClick={() => navigate("/leaderboard")}
              >
                Tout voir
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="recent-sessions-list">
              {loading && recent.length === 0 && (
                <div className="recent-session-item">
                  <div className="recent-session-date">Chargement…</div>
                </div>
              )}
              {!loading && recent.length === 0 && (
                <div className="recent-session-item">
                  <div className="recent-session-date">Aucune session récente</div>
                </div>
              )}
              {recent.map((session, index) => {
                const winner = session.winner;
                const winnerName = winner
                  ? [winner.prenom, winner.nom].filter(Boolean).join(" ") ||
                    winner.pseudo
                  : "—";
                return (
                  <div
                    key={session.id}
                    className="recent-session-item"
                    style={{
                      backgroundColor:
                        index === 1 ? "rgba(17, 20, 19, 0.5)" : "transparent",
                    }}
                    onClick={() => navigate(`/session/${session.id}`)}
                  >
                    <div className="recent-session-date">
                      {formatDateShort(session.date)}
                    </div>
                    <div className="recent-session-winner">
                      <div
                        className="recent-session-avatar"
                        style={{
                          backgroundColor: winner
                            ? avatarColor(winner.utilisateurid || winner.id)
                            : "var(--surface-container)",
                        }}
                      >
                        {winner ? initialsOf(winner) : "—"}
                      </div>
                      <span className="recent-session-name">{winnerName}</span>
                    </div>
                    <div className="recent-session-points">
                      <span className="recent-session-points-badge">
                        {winner ? `${formatPoints(winner.score || winner.points)} PTS` : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default Dashboard;
