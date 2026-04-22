import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./AdminPanel.css";

function AdminPanel() {
  const navigate = useNavigate();
  const [newPlayer, setNewPlayer] = useState({ name: "", email: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionResults, setSessionResults] = useState([
    { rank: 1, player: "", points: "" },
    { rank: 2, player: "", points: "" },
    { rank: 3, player: "", points: "" },
  ]);

  const players = [
    {
      id: 1,
      name: "Marcus Aurelius",
      initials: "MA",
      joined: "Mar 2023",
      color: "var(--primary)",
    },
    {
      id: 2,
      name: "Seneca the Younger",
      initials: "SY",
      joined: "Feb 2023",
      color: "var(--tertiary)",
      highlighted: true,
    },
    {
      id: 3,
      name: "Epictetus",
      initials: "EP",
      joined: "Jan 2023",
      color: "var(--secondary)",
    },
    {
      id: 4,
      name: "Zeno of Citium",
      initials: "ZC",
      joined: "Dec 2022",
      color: "var(--on-surface-variant)",
    },
  ];

  const handleNewPlayerSubmit = (e) => {
    e.preventDefault();
    console.log("New player:", newPlayer);
    setNewPlayer({ name: "", email: "" });
  };

  const handleSessionSubmit = (e) => {
    e.preventDefault();
    console.log("Session results:", sessionResults);
  };

  return (
    <div className="admin-page">
      <Navbar />

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">Admin Console</h1>
          <p className="admin-description">
            Orchestrate your club's community and competitive spirit.
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
                <h2 className="admin-section-title">Onboard New Player</h2>
              </div>
              <form className="admin-form" onSubmit={handleNewPlayerSubmit}>
                <div className="admin-form-row">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="e.g. Julian Casablancas"
                    value={newPlayer.name}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, name: e.target.value })
                    }
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="julian@strokes.com"
                    value={newPlayer.email}
                    onChange={(e) =>
                      setNewPlayer({ ...newPlayer, email: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-actions">
                  <Button type="submit">Add Member</Button>
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
                  <h2 className="admin-section-title">Log Session Results</h2>
                </div>
                <div className="admin-date-badge">
                  <span className="material-symbols-outlined">
                    calendar_today
                  </span>
                  <span>Oct 24, 2023</span>
                </div>
              </div>

              <form
                className="admin-session-form"
                onSubmit={handleSessionSubmit}
              >
                <div className="admin-session-entries">
                  {sessionResults.map((result, index) => (
                    <div
                      key={result.rank}
                      className="admin-session-entry"
                      style={{ opacity: index === 2 ? 0.6 : 1 }}
                    >
                      <div className="admin-session-rank">
                        <span
                          className={`admin-session-rank-badge ${index === 0 ? "admin-session-rank-badge-first" : ""}`}
                        >
                          {index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}
                        </span>
                      </div>
                      <div className="admin-session-player">
                        <select className="admin-session-select">
                          <option>Select Player...</option>
                          <option>Marcus Aurelius</option>
                          <option>Seneca the Younger</option>
                          <option>Epictetus</option>
                        </select>
                      </div>
                      <div className="admin-session-points">
                        <input
                          type="number"
                          placeholder="Points"
                          className="admin-session-input"
                        />
                        <span className="admin-session-pts">PTS</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="admin-session-actions">
                  <Button variant="secondary">Submit Session Results</Button>
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
                  <h2 className="admin-section-title">Manage Players</h2>
                </div>
                <div className="admin-search">
                  <span className="material-symbols-outlined admin-search-icon">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
              </div>

              <div className="admin-players-list">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`admin-player-item ${player.highlighted ? "admin-player-item-highlighted" : ""}`}
                  >
                    <div className="admin-player-info">
                      <div
                        className="admin-player-avatar"
                        style={{
                          backgroundColor: `${player.color}${player.color.includes("var") ? "" : "1a"}`,
                        }}
                      >
                        <span style={{ color: player.color }}>
                          {player.initials}
                        </span>
                      </div>
                      <div>
                        <h3 className="admin-player-name">{player.name}</h3>
                        <p className="admin-player-joined">
                          Joined {player.joined}
                        </p>
                      </div>
                    </div>
                    <div className="admin-player-actions">
                      <button className="admin-player-action admin-player-action-edit">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="admin-player-action admin-player-action-delete">
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
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
