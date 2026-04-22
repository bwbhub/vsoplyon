import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import { tournois, leaderboard as lbApi } from "../../services/api";
import {
  formatPoints,
  initials as initialsOf,
  avatarColor,
  fullName,
} from "../../utils/format";
import "./Leaderboard.css";

function Leaderboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("current"); // current | alltime
  const [currentTournoi, setCurrentTournoi] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        if (activeFilter === "current") {
          const list = await tournois.list();
          const current = list?.[0] || null;
          if (!alive) return;
          setCurrentTournoi(current);
          if (current) {
            const data = await lbApi.byTournoi(current.id, 500);
            if (!alive) return;
            setRows(
              (data || []).map((r) => ({
                id: r.id,
                nom: r.nom,
                prenom: r.prenom,
                pseudo: r.pseudo,
                points: Number(r.total || 0),
              }))
            );
          } else {
            setRows([]);
          }
        } else {
          const data = await lbApi.allTime(500);
          if (!alive) return;
          setCurrentTournoi(null);
          setRows(
            (data || []).map((r) => ({
              id: r.id,
              nom: r.nom,
              prenom: r.prenom,
              pseudo: r.pseudo,
              points: Number(r.total_score || 0),
              participations: Number(r.participations || 0),
            }))
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeFilter]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const name = [r.prenom, r.nom, r.pseudo].filter(Boolean).join(" ").toLowerCase();
      return name.includes(q);
    });
  }, [rows, searchTerm]);

  const topThree = filtered.slice(0, 3);
  const others = filtered.slice(3);
  const visibleOthers = showAll ? others : others.slice(0, 20);

  return (
    <div className="leaderboard-page">
      <Navbar />

      <main className="leaderboard-main">
        <header className="leaderboard-header">
          <div>
            <span className="leaderboard-label">Classement</span>
            <h1 className="leaderboard-title">
              {activeFilter === "current"
                ? currentTournoi?.nom || "Saison en cours"
                : "Temple des légendes"}
            </h1>
          </div>
          <div className="leaderboard-controls">
            <div className="leaderboard-search">
              <span className="material-symbols-outlined leaderboard-search-icon">
                search
              </span>
              <input
                type="text"
                placeholder="RECHERCHER UN JOUEUR..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="leaderboard-search-input"
              />
            </div>
            <div className="leaderboard-filter">
              <button
                className={`leaderboard-filter-btn ${activeFilter === "current" ? "active" : ""}`}
                onClick={() => setActiveFilter("current")}
              >
                Saison en cours
              </button>
              <button
                className={`leaderboard-filter-btn ${activeFilter === "alltime" ? "active" : ""}`}
                onClick={() => setActiveFilter("alltime")}
              >
                Tous les temps
              </button>
            </div>
          </div>
        </header>

        {loading && (
          <p style={{ opacity: 0.7, marginBottom: "1rem" }}>Chargement du classement…</p>
        )}

        {!loading && filtered.length === 0 && (
          <p style={{ opacity: 0.7, marginBottom: "1rem" }}>
            Aucun joueur à afficher.
          </p>
        )}

        {topThree.length > 0 && (
          <section className="leaderboard-podium">
            {topThree.map((player, index) => {
              const rank = index + 1;
              const orderClass =
                rank === 1
                  ? "podium-card-first podium-card-winner"
                  : rank === 2
                    ? "podium-card-second"
                    : "podium-card-third";
              return (
                <div
                  key={player.id}
                  className={`podium-card ${orderClass}`}
                >
                  <div className="podium-card-bg-icon">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      {rank === 1
                        ? "trophy"
                        : rank === 2
                          ? "workspace_premium"
                          : "military_tech"}
                    </span>
                  </div>
                  <div className="podium-card-content">
                    <div className="podium-card-header">
                      <div
                        className="podium-card-avatar"
                        style={{
                          backgroundColor: avatarColor(player.id),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "1.25rem",
                        }}
                      >
                        {initialsOf(player)}
                      </div>
                      <div>
                        <span className="podium-card-rank">
                          Rang {String(rank).padStart(2, "0")}
                        </span>
                        <h3 className="podium-card-name">{fullName(player)}</h3>
                      </div>
                    </div>
                    {rank === 1 ? (
                      <>
                        <div className="podium-card-badge">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                          >
                            stars
                          </span>
                          Leader du club
                        </div>
                        <div className="podium-card-stats-winner">
                          <div>
                            <span className="podium-card-stat-label">
                              Total points
                            </span>
                            <div className="podium-card-stat-value">
                              {formatPoints(player.points)}
                            </div>
                          </div>
                          {player.participations !== undefined && (
                            <div className="podium-card-stat-right">
                              <span className="podium-card-stat-label">Sessions</span>
                              <div className="podium-card-stat-value">
                                {player.participations}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="podium-card-stats">
                        <div>
                          <span className="podium-card-stat-label">Points</span>
                          <div className="podium-card-stat-value">
                            {formatPoints(player.points)}
                          </div>
                        </div>
                        {player.participations !== undefined && (
                          <div className="podium-card-stat-right">
                            <span className="podium-card-stat-label">Sessions</span>
                            <div className="podium-card-stat-value podium-card-stat-tertiary">
                              {player.participations}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {others.length > 0 && (
          <section className="leaderboard-table">
            <div className="leaderboard-table-header">
              <div className="leaderboard-col-rank">#</div>
              <div className="leaderboard-col-player">Joueur</div>
              <div className="leaderboard-col-sessions">Sessions</div>
              <div className="leaderboard-col-avg">Pseudo</div>
              <div className="leaderboard-col-points">Points</div>
            </div>

            <div className="leaderboard-table-body">
              {visibleOthers.map((player, index) => {
                const rank = index + 4;
                return (
                  <div key={player.id} className="leaderboard-row">
                    <div className="leaderboard-col-rank">
                      <span className="leaderboard-rank-number">
                        {String(rank).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="leaderboard-col-player">
                      <div
                        className="leaderboard-player-avatar"
                        style={{
                          backgroundColor: avatarColor(player.id),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                        }}
                      >
                        {initialsOf(player)}
                      </div>
                      <span className="leaderboard-player-name">
                        {fullName(player)}
                      </span>
                    </div>
                    <div className="leaderboard-col-sessions">
                      <span className="leaderboard-sessions">
                        {player.participations ?? "—"}
                      </span>
                    </div>
                    <div className="leaderboard-col-avg">
                      <span className="leaderboard-avg">
                        {player.pseudo || "—"}
                      </span>
                    </div>
                    <div className="leaderboard-col-points">
                      <span className="leaderboard-points">
                        {formatPoints(player.points)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {others.length > 20 && (
              <div className="leaderboard-table-footer">
                <button
                  className="leaderboard-view-more"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "Réduire" : `Voir le classement complet (${others.length})`}
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default Leaderboard;
