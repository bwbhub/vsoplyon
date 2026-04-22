import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import Button from "../../components/Button/Button";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const recentSessions = [
    {
      id: 1,
      date: "Oct 20, 2023",
      winner: "Alex Chen",
      initials: "AC",
      points: 480,
      bgColor: "var(--secondary-container)",
    },
    {
      id: 2,
      date: "Oct 13, 2023",
      winner: "Sarah Miller",
      initials: "SM",
      points: 310,
      bgColor: "rgba(217, 167, 119, 0.3)",
    },
    {
      id: 3,
      date: "Oct 06, 2023",
      winner: "Julian Ward",
      initials: "JW",
      points: 620,
      bgColor: "rgba(136, 212, 204, 0.1)",
    },
  ];

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <p className="dashboard-label">Member Dashboard</p>
          <h1 className="dashboard-title">Welcome, Julian.</h1>
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
                    Upcoming Session
                  </span>
                </div>
                <h2 className="next-session-title">Friday Night Social</h2>
                <div className="next-session-details">
                  <div className="next-session-detail">
                    <span className="material-symbols-outlined">
                      calendar_today
                    </span>
                    <span>October 27th, 2023</span>
                  </div>
                  <div className="next-session-detail">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>19:30 - Late</span>
                  </div>
                  <div className="next-session-detail">
                    <span className="material-symbols-outlined">group</span>
                    <span>08 / 10 Players Joined</span>
                  </div>
                </div>
              </div>
              <div className="next-session-actions">
                <div className="next-session-image">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhOYwkImH7pGvqSW9Sfu4SAN19rtAHhuf6Bb9PS0dFJ5WoT-5BK3U_TPjvb4KtGEfPZqeyxruVgd1VcSzmN0MfsPaJYsaFz3iqY5VJwG7SA_YbCSHw8doV66ziUTDmmZtXumk75dXIE4mOfq7p_Zcaxm74fhST0V3yTg0kmbmA22LVNieb66YJP4ZeeHdIbA8dJoHfvjsPo2KrYyxOKS-IaMgseMWpK_QflUvC1-pgg1R6EqqcsTz-un5MfYB8Q9-vS7vXfFuBKuY"
                    alt="Lounge"
                  />
                </div>
                <Button onClick={() => navigate("/session/upcoming")}>
                  Join Session
                </Button>
              </div>
            </div>
          </section>

          <aside className="season-rank">
            <div className="grain-texture"></div>
            <div className="season-rank-content">
              <p className="season-rank-label">Seasonal Progress</p>
              <div className="season-rank-position">
                <p className="season-rank-subtitle">Current Position</p>
                <div className="season-rank-number">
                  <span className="season-rank-hash">#3</span>
                  <span className="season-rank-total">of 24</span>
                </div>
              </div>
              <div className="season-rank-stats">
                <div className="season-rank-progress">
                  <div className="season-rank-progress-header">
                    <span>Points Progress</span>
                    <span className="season-rank-points">1,450 PTS</span>
                  </div>
                  <div className="season-rank-bar">
                    <div
                      className="season-rank-bar-fill"
                      style={{ width: "72%" }}
                    ></div>
                  </div>
                  <p className="season-rank-progress-text">
                    350 PTS to Rank #2
                  </p>
                </div>
                <div className="season-rank-performance">
                  <div className="season-rank-performance-icon">
                    <span className="material-symbols-outlined">
                      trending_up
                    </span>
                  </div>
                  <div>
                    <p className="season-rank-performance-label">
                      Recent Performance
                    </p>
                    <p className="season-rank-performance-value">
                      +120 PTS Last Session
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="recent-sessions">
            <div className="recent-sessions-header">
              <div>
                <p className="recent-sessions-label">Archive</p>
                <h3 className="recent-sessions-title">Recent Sessions</h3>
              </div>
              <button
                className="recent-sessions-view-all"
                onClick={() => navigate("/leaderboard")}
              >
                View All
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            <div className="recent-sessions-list">
              {recentSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="recent-session-item"
                  style={{
                    backgroundColor:
                      index === 1 ? "rgba(17, 20, 19, 0.5)" : "transparent",
                  }}
                  onClick={() => navigate(`/session/${session.id}`)}
                >
                  <div className="recent-session-date">{session.date}</div>
                  <div className="recent-session-winner">
                    <div
                      className="recent-session-avatar"
                      style={{ backgroundColor: session.bgColor }}
                    >
                      {session.initials}
                    </div>
                    <span className="recent-session-name">
                      {session.winner}
                    </span>
                  </div>
                  <div className="recent-session-points">
                    <span className="recent-session-points-badge">
                      {session.points} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default Dashboard;
