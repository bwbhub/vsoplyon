import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import BottomNav from '../../components/BottomNav/BottomNav'
import './SessionResult.css'

function SessionResult() {
  const navigate = useNavigate()

  const rankings = [
    {
      rank: 1,
      name: 'Julian Vance',
      nickname: 'Social Architect',
      points: 1240,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0QJmx7qgMD11jFIRphJJWaVmIgaIfX-tq96wGUQ7vQI2ztCkCgWO6TgdfqyRrj99ejC9-LBBXKLgHHNkzEBaYE_Qpmeik8tKo_B1iXfP3eNGy-DQyRqeOQtRcqCRcpo9vEP32Ip6dpzK8ixXRjGRdErkFVyjNjnVO-BtipEdSYPMMivCchj5Swx20Ke2Xw25evmhOBWl7Gd5cqj6LOkTWJEYd0uD7FZXS4hIQzlTUiZKIz2GGAs52Bzh5YJpkd8pw4eeZkCwW6M4'
    },
    {
      rank: 2,
      name: 'Sarah Chen',
      nickname: 'Strategist',
      points: 950,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2I1n6Q26ONVJh_S1bs8IHqnkunUO-GPqmnHtAO8nz7hWCHzS0HdmLLD8DVHogNf0HMtcVWrWXFsDWuCAfDZP6r_T5U0lvig0wP8xU1j8FCDVYXOzG9z7fdhK9KwRx4SsdKT1J5V9h-37LaHexLznnid06nvE6jndYsFcJqC_sPX7QAe5GcF6G8p5yGb_HRAljf4_3np7RS9Ce3Ig_mSlJMJSv_9ZUCzSbA_p0A5H-k7pG8eIUPRIuTC8HYWBwh__PNOifjYvRGT8'
    },
    {
      rank: 3,
      name: 'Marcus Reed',
      nickname: 'The General',
      points: 820,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtLgKYCBwC66WjqZFVMpH5hJLo_uvhZT3xwQx7xrecdOYkAQyp1h8SafWL-x3R2UiKnD8U01-9hqfYSG3ePWsLsmDDFBr-FVRLny0jbPmw8Uh5Du8LXkwJctsebwIgDpcNZe-pAxhUR67slWKBUXZEfvehOMiefWWzaPPCrOTYlTKShfzGhU_96MYA688yYBMh_AI9AzH91jI4ZFZoZLxKRloXugb-GZ1kRhbxsYho6GAXDciqfOc52aKrVJA1CLOdfrYYL4FEraA'
    },
    { rank: 4, name: 'Elena Sofia', nickname: 'Observer', points: 640 },
    { rank: 5, name: 'Tariq Ahmed', nickname: 'The Wildcard', points: 410 }
  ]

  return (
    <div className="session-result-page">
      <Navbar />
      
      <main className="session-result-main">
        <div className="session-result-back">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back to Sessions</span>
          </button>
        </div>

        <div className="session-result-header">
          <div>
            <span className="session-result-date">December 21, 2023</span>
            <h1 className="session-result-title">Winter Solstice Game</h1>
          </div>
          <div className="session-result-status">
            <div className="session-result-status-text">
              <span className="session-result-status-label">Session Status</span>
              <span className="session-result-status-value">Finalized</span>
            </div>
            <span className="material-symbols-outlined session-result-status-icon" style={{ fontVariationSettings: '"FILL" 1' }}>
              verified
            </span>
          </div>
        </div>

        <div className="session-insights">
          <div className="session-insight-primary">
            <div>
              <span className="session-insight-label">The MVP</span>
              <h3 className="session-insight-title">Player with the most wins</h3>
            </div>
            <div className="session-insight-mvp">
              <div className="session-insight-avatar">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLf2IK2NdXP9qorRjGipFJWO4iqfovijju0Eyktd1UrHVDWAi9W8pQmIndrqlNYG2568ZqsIwbnJJCi9FWedoQFsw4DrZcxGvC5rs4QOZ-X4R3GPszAsv9lAQXQTp7K9b3c386Pd1CrAXSRI6nGmCrMrILshYBa1OoOoj30ztrpnfHVuK9qiyoDYlFx-E0E6YfQ00VRDT1GNhxmhKCwPh2Y-OGqLoos-nHVFXjo5NK3MGOlHDdME_CBmzzRAUm2A0IpWP49ck_52Q"
                  alt="Julian Vance"
                />
              </div>
              <div>
                <p className="session-insight-mvp-name">Julian "The Architect" Vance</p>
                <p className="session-insight-mvp-desc">Maintained top rank for 120 minutes</p>
              </div>
            </div>
            <div className="session-insight-glow"></div>
          </div>

          <div className="session-insights-secondary">
            <div className="session-insight-card">
              <div>
                <span className="session-insight-card-label">Average Player Count</span>
                <div className="session-insight-card-value">12</div>
              </div>
              <span className="material-symbols-outlined session-insight-card-icon">groups</span>
            </div>
            <div className="session-insight-card">
              <div>
                <span className="session-insight-card-label">Total Points Distributed</span>
                <div className="session-insight-card-value session-insight-card-value-primary">
                  4,850
                  <span className="session-insight-card-unit">PTS</span>
                </div>
              </div>
              <span className="material-symbols-outlined session-insight-card-icon session-insight-card-icon-primary">database</span>
            </div>
          </div>
        </div>

        <div className="session-rankings">
          <div className="session-rankings-header">
            <h2 className="session-rankings-title">Session Rankings</h2>
            <div className="session-rankings-badges">
              <span className="session-rankings-badge session-rankings-badge-active">Points Only</span>
              <span className="session-rankings-badge">Season 4</span>
            </div>
          </div>

          <div className="session-rankings-table">
            <div className="session-rankings-table-header">
              <div className="session-rankings-col-rank">Rank</div>
              <div className="session-rankings-col-player">Player</div>
              <div className="session-rankings-col-points">Points Won</div>
            </div>

            <div className="session-rankings-list">
              {rankings.map((player) => (
                <div
                  key={player.rank}
                  className={`session-ranking-row ${player.rank === 1 ? 'session-ranking-row-winner' : ''}`}
                >
                  <div className="session-ranking-rank">
                    <div className={`session-ranking-rank-badge ${player.rank === 1 ? 'session-ranking-rank-badge-winner' : ''}`}>
                      {player.rank}
                    </div>
                  </div>
                  <div className="session-ranking-player">
                    {player.image ? (
                      <img src={player.image} alt={player.name} className="session-ranking-avatar" />
                    ) : (
                      <div className="session-ranking-avatar-placeholder">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                    <div>
                      <span className="session-ranking-name">{player.name}</span>
                      <span className="session-ranking-nickname">{player.nickname}</span>
                    </div>
                  </div>
                  <div className="session-ranking-points">
                    <span className={`session-ranking-points-value ${player.rank === 1 ? 'session-ranking-points-value-winner' : ''}`}>
                      {player.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="session-rankings-footer">
              <button className="session-rankings-show-more">+ Show 7 More Players</button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default SessionResult
