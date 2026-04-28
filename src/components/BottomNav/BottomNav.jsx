import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './BottomNav.css'

function BottomNav() {
  const location = useLocation()
  const { user } = useAuth()

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
        to="/sessions"
        className={`bottom-nav-item ${location.pathname.startsWith('/session') ? 'active' : ''}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: location.pathname.startsWith('/session') ? '"FILL" 1' : '"FILL" 0' }}>
          event
        </span>
        <span className="bottom-nav-label">Sessions</span>
      </Link>
      {user?.admin === true && (
        <Link
          to="/admin"
          className={`bottom-nav-item ${isActive('/admin') ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin') ? '"FILL" 1' : '"FILL" 0' }}>
            admin_panel_settings
          </span>
          <span className="bottom-nav-label">Admin</span>
        </Link>
      )}
    </nav>
  )
}

export default BottomNav
