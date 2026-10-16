
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: email.trim(), password });
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
        });
      }

      navigate("/reports", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode((previous) => previous === "login" ? "register" : "login");
    setError("");
    setPassword("");
  }

  return (
    <main className="auth-layout">
      <section className="auth-story">
        <Link className="auth-back" to="/">← Back to home</Link>

        <div className="auth-story-content">
          <span className="eyebrow">FIND BACK WHAT MATTERS</span>
          <h1>Better together.<br />Stronger as a community.</h1>
          <p>
            Every lost item matters to someone. Join your community
            in helping belongings find their way home.
          </p>

          <div className="auth-story-location">
            <span>⌖</span>
            Proudly serving Addis Ababa, Ethiopia
          </div>
        </div>

        <div className="auth-story-bottom">
          <span>FindBack Ethiopia</span>
          <span>Community • Care • Connection</span>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <div className="auth-mobile-brand">FindBack Ethiopia</div>

          <span className="eyebrow">YOUR COMMUNITY ACCOUNT</span>
          <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Sign in to report items and help your community."
              : "Join FindBack Ethiopia and start making a difference."}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <div className="password-field">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {!isLogin && (
                <small>Use at least 8 characters.</small>
              )}
            </div>

            {error && (
              <p className="auth-error" role="alert">{error}</p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Log In →"
                : "Create Account →"}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          <p className="auth-switch">
            {isLogin
              ? "New to FindBack Ethiopia?"
              : "Already have an account?"}
            <button type="button" onClick={switchMode}>
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
