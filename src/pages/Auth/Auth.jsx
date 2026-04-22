import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(formData.login.trim(), formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="auth-page">
      <main className="auth-container">
        <div className="auth-brand">
          <h1 className="auth-title">VSOP-LYON</h1>
          <div className="auth-subtitle">
            <span className="auth-divider"></span>
            <span className="auth-subtitle-text">Espace Membre</span>
            <span className="auth-divider"></span>
          </div>
        </div>

        <div className="auth-card">
          <header className="auth-header">
            <h2 className="auth-heading">Bon retour</h2>
            <p className="auth-description">
              Entrez vos identifiants pour accéder au club.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Pseudo ou e-mail"
              icon="person"
              type="text"
              id="login"
              name="login"
              placeholder="votre pseudo ou email"
              required
              value={formData.login}
              onChange={handleChange}
            />

            <div className="input-group">
              <div className="input-label-row">
                <label htmlFor="password" className="input-label">
                  Mot de passe
                </label>
                <a href="#" className="auth-forgot">
                  Oublié ?
                </a>
              </div>
              <div className="input-wrapper">
                <div className="input-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  className="input input-with-icon"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-remember">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="auth-checkbox"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="auth-remember-label">
                Rester connecté sur cette session
              </label>
            </div>

            {error && (
              <p style={{ color: "#e57373", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            )}

            <Button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Connexion..." : "Entrer dans le club"}
            </Button>
          </form>

        </div>

        <div className="auth-ornament auth-ornament-top"></div>
        <div className="auth-ornament auth-ornament-bottom"></div>
      </main>

      <div className="auth-grain"></div>
    </div>
  );
}

export default Auth;
