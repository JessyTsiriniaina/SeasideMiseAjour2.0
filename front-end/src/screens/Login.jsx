import { useState, useContext } from "react";
import './login.css'
import axiosInstance from "../api/axios";
import AuthContext from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const data = {
      email,
      motDePasse: password,
    };

    try {
      const response = await axiosInstance.post(
        "/auth/login",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const accessToken = response?.data?.token;
      const refreshToken = response?.data?.refreshToken;
      const userRole = response?.data?.role;
      const userName = response?.data?.nomUtilisateur;
      setAuth({ email, accessToken, refreshToken, userRole, userName });

      setEmail("");
      setPassword("");
      if (userRole === "ADMIN") {
        navigate("/admin/");
      } else {
        navigate("/dashboard");
      }
      //success
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Adresse e-mail ou mot de passe incorrect.");
      } else {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      }

      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Connexion</h1>
        <p className="login-subtitle">Accédez à votre tableau de bord</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="login-error">
              {errorMessage}
            </div>
          )}
          <div className="login-field">
            <label className="login-label" htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
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
