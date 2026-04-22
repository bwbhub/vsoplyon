import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import "./Auth.css";

function Auth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
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
          <h1 className="auth-title">The Social Architect</h1>
          <div className="auth-subtitle">
            <span className="auth-divider"></span>
            <span className="auth-subtitle-text">Member Access</span>
            <span className="auth-divider"></span>
          </div>
        </div>

        <div className="auth-card">
          <header className="auth-header">
            <h2 className="auth-heading">Welcome Back</h2>
            <p className="auth-description">
              Please enter your credentials to enter the club.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              icon="mail"
              type="email"
              id="email"
              name="email"
              placeholder="name@architect.com"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <div className="input-group">
              <div className="input-label-row">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <a href="#" className="auth-forgot">
                  Forgot?
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
                Stay signed in for this session
              </label>
            </div>

            <Button type="submit" className="auth-submit">
              Enter the Hearth
            </Button>
          </form>

          <footer className="auth-footer">
            <p className="auth-footer-text">
              Not a member yet?
              <a href="#" className="auth-signup">
                Apply for Membership
              </a>
            </p>
          </footer>
        </div>

        <div className="auth-ornament auth-ornament-top"></div>
        <div className="auth-ornament auth-ornament-bottom"></div>
      </main>

      <div className="auth-grain"></div>
    </div>
  );
}

export default Auth;
