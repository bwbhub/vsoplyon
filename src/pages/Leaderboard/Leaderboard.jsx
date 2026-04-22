import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import "./Leaderboard.css";

function Leaderboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("current");

  const topThree = [
    {
      rank: 2,
      name: "Julian Vance",
      points: 2840,
      avgRank: 2.4,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCK8GUYgrsWHNF0Jp3_Su5VX_MIG4T2JDTTX6elMphQoATa0lQvjjD_J8L8DFCYkSMa-KF3ltSln9mkhxKfqIpPNzKDI5hPgI96KMS5WhDIUzfkHvBq03hQbZwRUmYkj1hTB5o3Hd_1eWRdtv1UQNuaGUcc4Wjce1MyieVq_VY--VGadbKuP62iO6WEyFhQpEZYU78L60_O4lkxSlyDtkCE8C-yZp8nKWQDihZ_501eleWRHlzKOTxf3AiC8jJOCPTS8hIwPhC8Fak",
    },
    {
      rank: 1,
      name: "Elena Rossi",
      points: 4120,
      sessions: 18,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDSG6h8PWA4WLQVr1l-hw0zi-Z6db3Jdo8E6YGSIUMs8f8yuLE57SM1nKWL6IWi8Xd_uDGvraJSwGlewkJGk-sTmYrNl0EhTOzPUW2vkDQ45YCLqJ5dHU77xvA0wi1q2TQ3jKq41Q4rdnw_TjVu-iod5sZIi0Tee6EdsOlBcPetTeeQnQtX5-YU3QYZjiH70QsQUvDJOlzEyuBRU8YAyA_4YDwleQWmUPSzBF0ktcJrKdz4U6LG9dwB5WGc5SzHw6iP8pdkNyQvANA",
    },
    {
      rank: 3,
      name: "Marcus Chen",
      points: 2610,
      avgRank: 3.1,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuArQGFnsrjQgE94ckZclG_chiwMYZ2pOGvjyIPYVZGEiDYWvkixxgzhPeuH1lGR4QDVV8LIY6iGMiUiXanyVDSMgQ_luimCPIXEBwwCyQNPWG2RC4bX9olKItk2Qpve0egcMjagscSvANii_aSSG2J2QHPfTaZqYIfYmgX1ZUV3qhUoRX8-OjuOZHwzVLdRQOfac1XJ7mxdRu9UgdPnksgksTzKkf79HzTM4V80J2MN4G2I7MVeaGoegLjBdf8o5vwpyvcEPXdhTgE",
    },
  ];

  const otherPlayers = [
    {
      rank: 4,
      name: "Sarah Jenkins",
      sessions: 14,
      avgRank: 3.8,
      points: 2150,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDeGUl1ClgRQOb3Jc_eCBeqI6xvFUsbj_m-Eg-CePSr4Yp3-J9opo19i6sQ77BMsle-_3KbPgWZ5DRuWZbXAG5NQCA4CMQ4UzTxMNdc_JJD_a9IHX14R6KFMr8EF0c0VcPeS3qk1HNWM733NlbYcg2PwrTkvw8n5RytILtaHK_uHgqtzK0YBS5Xv8ktmCFY43Op3076Tq9O0q2FXWvetu21P6MSPerWjziIR7GThojAoDLQCBsePW2bTNfbiseEdDQxqO7U0vF08nQ",
    },
    {
      rank: 5,
      name: "David Thorne",
      sessions: 12,
      avgRank: 4.2,
      points: 1980,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAI-sTL5mQYEkcd7hVENshx5E-qC7cEkIOA9CLawlu2ox9hRC3bvsvO7D40fHP-NP6GwowjoEGHVOMFQ98IhXJk-gEUdKncCimqdld4SUWtQGdGrLbpwY1EzzKWqNsdhiO6qWiOyYCsbef52vpcVXRPpyTPStB2CPxEeo7UHgew1VEd8RuU_RQ6W3adYEjocpqOpLjX05cUv5U2x8eqhFvZuBmX4jQjsASo3GOcBUTEqLmEgRKpJgamXPL6WZtY51Ri_Mi1HOBx-Y4",
    },
    {
      rank: 6,
      name: "Mia Kowalski",
      sessions: 11,
      avgRank: 4.5,
      points: 1820,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAIwp0Z4aJH2Y8lGwgWNI5FOezBXcv7VOs_XKsODermVy4Ltw36YOWHXjFXrxWSAUzSe-gH4EdBmdXFmp9Vm2-boIav7M9s92JHbKNrNFYFsH2UUhH0HJn2Z6rTWKW7GaynF9MCQG0oazNlfOgjpmf1A4bHElVMRfSBiwDyH8EMtBYa4B7TxktWiIWCjuMJxlwN0Xft1KbwJaAFwNAQ6HXeJruSNSqY63_B4kkJtL84CwCjto23yJAr1P3V04rlVAVQIAL0dviPD-8",
    },
    {
      rank: 7,
      name: "Robert Blake",
      sessions: 15,
      avgRank: 4.9,
      points: 1740,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB3O0ZVA7BXJKggtOL6XhJ5xWfBHjGEwoUNvbg4vb8BDANjxHJc2Yi_I1-WXK-YDRWAcKcZJzVyYsFJ50vqvo9IcpQPRkszpz5BOFRk9bDkg-s9gzQU044NmJpNjYeNzDV7O1VuIB6TdsfQb39FQBaquzE98HXl7uG_ji-ppNZOS43PmO7_FHHQB1yw57bsSXDKU16oeTXGKjMc9u-eG4RxsfQqu7ASxVyn9p4DMnYcsCqTOLHF7jHg1qyIVldXz2hoZYogC2iaGuA",
    },
    {
      rank: 8,
      name: "Lara Croft",
      sessions: 9,
      avgRank: 5.2,
      points: 1590,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDd5GoKwV9YRWirmyjnKMvISith1KhOjupgfJG1nM1Sk-Kb5YJ4cprN7j9NnBnW-f3QUFGVIQrZXjIPWCAMGdFCY4lyXzw7kCkzH85uPXBwJ80jrTzeK1H995bNFlfqkTvHQ4Oer31DigAzgZmn83pXI6tDVCXfI-9myuX4DjErLKO2zRVFqFlO-kpxk0n5_O6CZgGlHLQhicvu5kmYb2jpb3OE3F1K8eHJxTG4SevS3rb3MgzjNfjYIa1FWC-InvCbUTB_mlGNyB8",
    },
  ];

  return (
    <div className="leaderboard-page">
      <Navbar />

      <main className="leaderboard-main">
        <header className="leaderboard-header">
          <div>
            <span className="leaderboard-label">Competitive Standing</span>
            <h1 className="leaderboard-title">Hall of Fame</h1>
          </div>
          <div className="leaderboard-controls">
            <div className="leaderboard-search">
              <span className="material-symbols-outlined leaderboard-search-icon">
                search
              </span>
              <input
                type="text"
                placeholder="SEARCH PLAYERS..."
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
                Current Season
              </button>
              <button
                className={`leaderboard-filter-btn ${activeFilter === "alltime" ? "active" : ""}`}
                onClick={() => setActiveFilter("alltime")}
              >
                All Time
              </button>
            </div>
          </div>
        </header>

        <section className="leaderboard-podium">
          {topThree.map((player, index) => (
            <div
              key={player.rank}
              className={`podium-card ${player.rank === 1 ? "podium-card-winner" : ""} podium-card-${index === 0 ? "second" : index === 1 ? "first" : "third"}`}
              onClick={() => navigate("/session/1")}
            >
              <div className="podium-card-bg-icon">
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {player.rank === 1
                    ? "trophy"
                    : player.rank === 2
                      ? "workspace_premium"
                      : "military_tech"}
                </span>
              </div>
              <div className="podium-card-content">
                <div className="podium-card-header">
                  <div className="podium-card-avatar">
                    <img src={player.image} alt={player.name} />
                  </div>
                  <div>
                    <span className="podium-card-rank">
                      Rank {String(player.rank).padStart(2, "0")}
                    </span>
                    <h3 className="podium-card-name">{player.name}</h3>
                  </div>
                </div>
                {player.rank === 1 ? (
                  <>
                    <div className="podium-card-badge">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        stars
                      </span>
                      Club Leader
                    </div>
                    <div className="podium-card-stats-winner">
                      <div>
                        <span className="podium-card-stat-label">
                          Total Points
                        </span>
                        <div className="podium-card-stat-value">
                          {player.points.toLocaleString()}
                        </div>
                      </div>
                      <div className="podium-card-stat-right">
                        <span className="podium-card-stat-label">Sessions</span>
                        <div className="podium-card-stat-value">
                          {player.sessions}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="podium-card-stats">
                    <div>
                      <span className="podium-card-stat-label">Points</span>
                      <div className="podium-card-stat-value">
                        {player.points.toLocaleString()}
                      </div>
                    </div>
                    <div className="podium-card-stat-right">
                      <span className="podium-card-stat-label">Avg. Rank</span>
                      <div className="podium-card-stat-value podium-card-stat-tertiary">
                        {player.avgRank}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="leaderboard-table">
          <div className="leaderboard-table-header">
            <div className="leaderboard-col-rank">#</div>
            <div className="leaderboard-col-player">Player</div>
            <div className="leaderboard-col-sessions">Sessions</div>
            <div className="leaderboard-col-avg">Avg. Rank</div>
            <div className="leaderboard-col-points">Points</div>
          </div>

          <div className="leaderboard-table-body">
            {otherPlayers.map((player) => (
              <div
                key={player.rank}
                className="leaderboard-row"
                onClick={() => navigate("/session/1")}
              >
                <div className="leaderboard-col-rank">
                  <span className="leaderboard-rank-number">
                    {String(player.rank).padStart(2, "0")}
                  </span>
                </div>
                <div className="leaderboard-col-player">
                  <div className="leaderboard-player-avatar">
                    <img src={player.image} alt={player.name} />
                  </div>
                  <span className="leaderboard-player-name">{player.name}</span>
                </div>
                <div className="leaderboard-col-sessions">
                  <span className="leaderboard-sessions">
                    {player.sessions}
                  </span>
                </div>
                <div className="leaderboard-col-avg">
                  <span className="leaderboard-avg">{player.avgRank}</span>
                </div>
                <div className="leaderboard-col-points">
                  <span className="leaderboard-points">
                    {player.points.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="leaderboard-table-footer">
            <button className="leaderboard-view-more">
              View Complete Standings
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

export default Leaderboard;
