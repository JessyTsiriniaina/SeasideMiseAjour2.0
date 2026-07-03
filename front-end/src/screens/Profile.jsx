import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthProvider";
import { updateProfile, changePassword } from "../services/users";
import "./dashboard.css";

const Profile = () => {
  const { auth, setAuth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const profile = auth.profile || {};

  const [form, setForm] = useState({
    name: profile.nomUtilisateur || auth.userName || "",
    email: profile.email || auth.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    setForm((current) => ({
      name: profile.nomUtilisateur || auth.userName || current.name,
      email: profile.email || auth.email || current.email,
    }));
  }, [profile, auth.userName, auth.email]);

  const update = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
    setError("");
    setMessage("");
  };

  const updatePassword = (field) => (e) => {
    setPasswordForm((current) => ({ ...current, [field]: e.target.value }));
    setPasswordError("");
    setPasswordMessage("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.name.trim()) {
      return setError("Le nom est requis.");
    }
    if (!form.email.trim()) {
      return setError("L'email est requis.");
    }

    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setMessage("Profil mis à jour.");
      await setAuth({
        ...auth,
        userName: updated.nomUtilisateur,
        email: updated.email,
        profile: updated,
      });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Impossible de mettre à jour le profil.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordForm.oldPassword.trim()) {
      return setPasswordError("L'ancien mot de passe est requis.");
    }
    if (!passwordForm.newPassword.trim()) {
      return setPasswordError("Le nouveau mot de passe est requis.");
    }
    if (passwordForm.newPassword !== passwordForm.confirmation) {
      return setPasswordError("La confirmation du mot de passe ne correspond pas.");
    }

    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmation: passwordForm.confirmation,
      });
      setPasswordMessage("Mot de passe modifié avec succès.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmation: "" });
    } catch (err) {
      setPasswordError(err?.response?.data?.message || err?.message || "Impossible de changer le mot de passe.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page profile-page">
      <header className="dashboard-header" id="dashboard-header">
        <h1 className="dashboard-brand">Mon profil</h1>
        <div className="dashboard-user">
          <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
            Retour
          </button>
          <button className="dashboard-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="profile-card">
          <h2 className="profile-title">Informations personnelles</h2>
          <form className="profile-form" onSubmit={handleProfileSubmit}>
            <div className="modal-field">
              <label className="modal-label">Nom complet</label>
              <input
                className="modal-input"
                type="text"
                value={form.name}
                onChange={update("name")}
                required
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Adresse e-mail</label>
              <input
                className="modal-input"
                type="email"
                value={form.email}
                onChange={update("email")}
                required
              />
            </div>
            {error && <p className="modal-error">{error}</p>}
            {message && <p className="modal-success">{message}</p>}
            <div className="modal-actions">
              <button type="submit" className="modal-button modal-button-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </section>

        <section className="profile-card">
          <h2 className="profile-title">Changer le mot de passe</h2>
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="modal-field">
              <label className="modal-label">Ancien mot de passe</label>
              <input
                className="modal-input"
                type="password"
                value={passwordForm.oldPassword}
                onChange={updatePassword("oldPassword")}
                required
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Nouveau mot de passe</label>
              <input
                className="modal-input"
                type="password"
                value={passwordForm.newPassword}
                onChange={updatePassword("newPassword")}
                required
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Confirmation</label>
              <input
                className="modal-input"
                type="password"
                value={passwordForm.confirmation}
                onChange={updatePassword("confirmation")}
                required
              />
            </div>
            {passwordError && <p className="modal-error">{passwordError}</p>}
            {passwordMessage && <p className="modal-success">{passwordMessage}</p>}
            <div className="modal-actions">
              <button type="submit" className="modal-button modal-button-primary">
                Mettre à jour le mot de passe
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Profile;
