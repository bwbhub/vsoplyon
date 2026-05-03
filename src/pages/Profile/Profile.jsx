import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useAuth } from "../../context/AuthContext";
import { stats, scores, users as usersApi, tournois } from "../../services/api";
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
  const { user: me, logout } = useAuth();
  const params = useParams();
  // /profile = mon profil ; /profile/:id = profil public d'un autre joueur
  const targetId = params.id ? Number(params.id) : me?.id;
  const isMe = !params.id || Number(params.id) === Number(me?.id);

  const [profileUser, setProfileUser] = useState(isMe ? me : null);
  const [stat, setStat] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(""); // "" = all-time

  // Chargement initial (user, historique, liste des saisons)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const [u, h, ts] = await Promise.all([
          isMe ? Promise.resolve(me) : usersApi.get(targetId),
          scores.byUtilisateur(targetId),
          tournois.list().catch(() => []),
        ]);
        if (!alive) return;
        setProfileUser(u);
        setHistory(h || []);
        setSeasons(ts || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [targetId, isMe, me]);

  // Stats : rechargees quand on change de saison
  useEffect(() => {
    let alive = true;
    stats
      .byUser(targetId || "me", selectedSeason || null)
      .then((s) => { if (alive) setStat(s); })
      .catch(() => { if (alive) setStat(null); });
    return () => { alive = false; };
  }, [targetId, selectedSeason]);

  const user = profileUser || me;

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
            <p className="profile-label">{isMe ? "Mon profil" : "Profil"}</p>
            <h1 className="profile-title">
              {[user?.prenom, user?.nom].filter(Boolean).join(" ") || user?.pseudo}
            </h1>
            {user?.pseudo && (
              <p className="profile-pseudo">@{user.pseudo}</p>
            )}
          </div>
        </header>

        {/* Selecteur de periode : All time + chaque saison */}
        <div className="profile-season-selector">
          <span className="material-symbols-outlined">filter_alt</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            <option value="">Toutes saisons (all-time)</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}{s.date_fin ? " (terminée)" : " (en cours)"}
              </option>
            ))}
          </select>
        </div>

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
          <StatCard
            icon="grid_view"
            label="Carrés"
            value={loading ? "—" : (stat?.total_carres ?? 0)}
            accent="primary"
          />
          <StatCard
            icon="auto_awesome"
            label="Royal flush"
            value={loading ? "—" : (stat?.total_royal_flush ?? 0)}
            accent="warning"
          />
          <StatCard
            icon="style"
            label="Quinte flush"
            value={loading ? "—" : (stat?.total_flush ?? 0)}
            accent="tertiary"
          />
          <StatCard
            icon="military_tech"
            label="Bounty hunter"
            value={loading ? "—" : (stat?.total_bounty ?? 0)}
            accent="success"
          />
        </section>

        {/* Hauts faits : premieres mains de chaque saison */}
        {Array.isArray(stat?.achievements) && stat.achievements.length > 0 && (
          <section className="profile-section">
            <header className="profile-section-header">
              <p className="profile-section-label">Hauts faits</p>
              <h2 className="profile-section-title">Premières mains de saison</h2>
            </header>
            <div className="profile-achievements">
              {stat.achievements.map((a) => {
                const meta = {
                  carre:        { icon: "grid_view",    label: "Premier carré",              accent: "primary" },
                  royal_flush:  { icon: "auto_awesome", label: "Première quinte flush royale", accent: "warning" },
                  flush:        { icon: "style",        label: "Première quinte flush",     accent: "tertiary" },
                }[a.hand] || { icon: "military_tech", label: a.hand, accent: "primary" };
                return (
                  <div key={`${a.hand}-${a.tournoi_id}`} className={`profile-achievement profile-achievement-${meta.accent}`}>
                    <div className={`profile-achievement-icon profile-stat-icon-${meta.accent}`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>{meta.icon}</span>
                    </div>
                    <div className="profile-achievement-content">
                      <span className="profile-achievement-label">{meta.label}</span>
                      <span className="profile-achievement-meta">
                        {a.tournoi_nom} · {formatDateShort(a.date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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

        {isMe && (
          <section className="profile-actions">
            <button className="profile-logout-btn" onClick={logout}>
              <span className="material-symbols-outlined">logout</span>
              Se déconnecter
            </button>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default Profile;
