import { useEffect } from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../config/config";
import "./notFoundPage.css";
import "./login.css"

const NotFoundPage = () => {
  useEffect(() => {
    document.title = `Page introuvable | ${APP_NAME}`;
  }, []);

  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-code">404</div>

        <h1 className="notfound-title">
          Page introuvable
        </h1>

        <p className="notfound-description">
          La page que vous recherchez n'existe pas
          ou a peut-être été déplacée.
        </p>

        <Link to="/" className="notfound-link">
          <button className="notfound-button">
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;