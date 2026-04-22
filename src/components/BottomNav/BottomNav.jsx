import { Link, useLocation } from 'react-router-dom'
import './BottomNav.css'

function BottomNav() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bottom-nav">
      <Link
        to="/dashboard"
        className={`bottom-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard') ? '"FILL" 1' : '"FILL" 0' }}>
          playing_cards
        </span>
        <span className="bottom-nav-label">Accueil</span>
      </Link>
      <Link
        to="/leaderboard"
        className={`bottom-nav-item ${isActive('/leaderboard') ? 'active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/leaderboard') ? '"FILL" 1' : '"FILL" 0' }}>
          trophy
        </span>
        <span className="bottom-nav-label">Classement</span>
      </Link>
      <Link
        to="/session/1"
        className={`bottom-nav-item ${location.pathname.startsWith('/session') ? 'active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname.startsWith('/session') ? '"FILL" 1' : '"FILL" 0' }}>
          groups
        </span>
        <span className="bottom-nav-label">Joueurs</span>
      </Link>
    </nav>
  )
}

export default BottomNav
