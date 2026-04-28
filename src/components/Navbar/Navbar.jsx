import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          VSOP-LYON
        </Link>
        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            Accueil
          </Link>
          <Link
            to="/leaderboard"
            className={`navbar-link ${isActive("/leaderboard") ? "active" : ""}`}
          >
            Classement
          </Link>
          <Link
            to="/sessions"
            className={`navbar-link ${location.pathname.startsWith("/session") ? "active" : ""}`}
          >
            Sessions
          </Link>
          {user?.admin === true && (
            <Link
              to="/admin"
              className={`navbar-link ${isActive("/admin") ? "active" : ""}`}
            >
              Admin
            </Link>
          )}
        </div>
        <div className="navbar-actions">
          <button
            className="navbar-profile"
            onClick={() => navigate("/profile")}
            title="Mon profil"
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="navbar-profile-text">
              {user ? (user.prenom || user.pseudo || "Profil") : "Profil"}
            </span>
          </button>
          <button
            className="navbar-profile navbar-logout"
            onClick={handleLogout}
            title="Se déconnecter"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
