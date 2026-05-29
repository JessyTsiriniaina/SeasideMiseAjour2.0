import { Link } from "react-router-dom";
import "./notFoundPage.css";
import "./login.css"

const NotFoundPage = () => {
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