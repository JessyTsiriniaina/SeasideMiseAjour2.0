import { useState } from "react";
import './login.css'

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Connexion</h1>
        <p className="login-subtitle">Accédez à votre tableau de bord</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label" htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

export default Login
