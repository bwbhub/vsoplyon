import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          The Social Architect
        </Link>
        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            Dashboard
          </Link>
          <Link
            to="/leaderboard"
            className={`navbar-link ${isActive("/leaderboard") ? "active" : ""}`}
          >
            Leaderboard
          </Link>
          <Link
            to="/session/1"
            className={`navbar-link ${location.pathname.startsWith("/session") ? "active" : ""}`}
          >
            Sessions
          </Link>
        </div>
        <div className="navbar-actions">
          <button className="navbar-profile" onClick={() => navigate("/admin")}>
            <span className="material-symbols-outlined">person</span>
            <span className="navbar-profile-text">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
