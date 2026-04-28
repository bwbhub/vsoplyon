import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import BottomNav from "../../components/BottomNav/BottomNav";
import { evenements } from "../../services/api";
import { formatDateLong } from "../../utils/format";
import "./Sessions.css";

function Sessions() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    evenements
      .list({ limit: 100 })
      .then((rows) => {
        if (alive) setList(rows || []);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const now = Date.now();
  const upcoming = list.filter((e) => new Date(e.date).getTime() >= now);
  const past = list.filter((e) => new Date(e.date).getTime() < now);

  const renderRow = (ev) => {
    const isFinale = ev.type === "finale";
    return (
      <button
        key={ev.id}
        type="button"
        className={`sessions-row ${isFinale ? "sessions-row-finale" : ""}`}
        onClick={() => navigate(`/session/${ev.id}`)}
      >
        <div className="sessions-row-date">
          <span className="material-symbols-outlined">calendar_today</span>
          <div>
            <div className="sessions-row-date-text">{formatDateLong(ev.date)}</div>
            {ev.lieu_nom && (
              <div className="sessions-row-lieu">{ev.lieu_nom}</div>
            )}
          </div>
        </div>
        <div className="sessions-row-meta">
          <span className="sessions-row-tournoi">{ev.tournoi_nom || "—"}</span>
          {isFinale && <span className="sessions-row-badge">🏆 FINALE</span>}
          {ev.annulation && <span className="sessions-row-cancelled">Annulée</span>}
        </div>
        <span className="material-symbols-outlined sessions-row-arrow">chevron_right</span>
      </button>
    );
  };

  return (
    <div className="sessions-page">
      <Navbar />
      <main className="sessions-main">
        <header className="sessions-header">
          <p className="sessions-label">Sessions</p>
          <h1 className="sessions-title">Toutes les sessions</h1>
        </header>

        {loading && <div className="sessions-empty">Chargement…</div>}
        {!loading && list.length === 0 && (
          <div className="sessions-empty">Aucune session</div>
        )}

        {upcoming.length > 0 && (
          <section className="sessions-section">
            <h2 className="sessions-section-title">À venir</h2>
            <div className="sessions-list">{upcoming.reverse().map(renderRow)}</div>
          </section>
        )}

        {past.length > 0 && (
          <section className="sessions-section">
            <h2 className="sessions-section-title">Passées</h2>
            <div className="sessions-list">{past.map(renderRow)}</div>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default Sessions;
