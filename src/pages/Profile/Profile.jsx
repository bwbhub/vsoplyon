import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useAuth } from "../../context/AuthContext";
import { stats, scores } from "../../services/api";
import { formatDateShort, avatarColor, initials as initialsOf } from "../../utils/format";
import "./Profile.css";

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="profile-stat-card">
      <div className="grain-texture"></div>
      <div className={`profile-stat-icon profile-stat-icon-${accent || "primary"}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
          {icon}
        </span>
      </div>
      <div className="profile-stat-content">
        <span className="profile-stat-value">{value}</span>
        <span className="profile-stat-label">{label}</span>
      </div>
    </div>
  );
}

function Profile() {
  const { user, logout } = useAuth();
  const [stat, setStat] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, h] = await Promise.all([
          stats.byUser("me"),
          scores.byUtilisateur(user?.id),
        ]);
        if (!alive) return;
        setStat(s);
        setHistory(h || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [user?.id]);

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-main">
        <header className="profile-header">
          <div
            className="profile-avatar"
            style={{ backgroundColor: avatarColor(user?.id) }}
          >
            {initialsOf(user)}
          </div>
          <div className="profile-identity">
            <p className="profile-label">Profil</p>
            <h1 className="profile-title">
              {[user?.prenom, user?.nom].filter(Boolean).join(" ") || user?.pseudo}
            </h1>
            {user?.pseudo && (
              <p className="profile-pseudo">@{user.pseudo}</p>
            )}
          </div>
        </header>

        <section className="profile-stats-grid">
          <StatCard
            icon="local_fire_department"
            label="Kills cumulés"
            value={loading ? "—" : (stat?.total_kills ?? 0)}
            accent="warning"
          />
          <StatCard
            icon="emoji_events"
            label="Tables finales (top 8)"
            value={loading ? "—" : (stat?.tables_finales ?? 0)}
            accent="primary"
          />
          <StatCard
            icon="military_tech"
            label="Victoires"
            value={loading ? "—" : (stat?.victoires ?? 0)}
            accent="success"
          />
          <StatCard
            icon="workspace_premium"
            label="Podiums"
            value={loading ? "—" : (stat?.podiums ?? 0)}
            accent="tertiary"
          />
          <StatCard
            icon="event_available"
            label="Sessions jouées"
            value={loading ? "—" : (stat?.total_participations ?? 0)}
            accent="primary"
          />
          <StatCard
            icon="leaderboard"
            label="Meilleur classement"
            value={loading ? "—" : (stat?.meilleure_position ? `#${stat.meilleure_position}` : "—")}
            accent="tertiary"
          />
        </section>

        <section className="profile-section">
          <header className="profile-section-header">
            <p className="profile-section-label">Historique</p>
            <h2 className="profile-section-title">Mes dernières sessions</h2>
          </header>
          <div className="profile-history">
            {loading && <div className="profile-history-empty">Chargement…</div>}
            {!loading && history.length === 0 && (
              <div className="profile-history-empty">Aucune session jouée</div>
            )}
            {history.slice(0, 10).map((h) => (
              <div key={h.id} className="profile-history-row">
                <div className="profile-history-date">{formatDateShort(h.date)}</div>
                <div className="profile-history-tournoi">{h.tournoi_nom || "—"}</div>
                <div className="profile-history-meta">
                  <span title="Position">
                    <span className="material-symbols-outlined">workspace_premium</span>
                    {h.position_sortie ? `#${h.position_sortie}` : "—"}
                  </span>
                  <span title="Kills">
                    <span className="material-symbols-outlined">local_fire_department</span>
                    {h.kills ?? 0}
                  </span>
                  <span title="Points" className="profile-history-points">
                    {h.score ?? 0} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-actions">
          <button className="profile-logout-btn" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            Se déconnecter
          </button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

export default Profile;
