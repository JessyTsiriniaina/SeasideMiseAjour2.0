import React from 'react'
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./login.css";
import "./dashboard.css";
import { fetchEvents, createEvent } from "../services/events";
import { APP_NAME } from '../config/config';
import AuthContext from "../context/AuthProvider";

export const emptyEvent = {
  name: "",
  date: "",
  location: "",
  description: "",
  cover: "",
  gates: [],
};

const Dashboard = () => {
  useEffect(() => {
    document.title = `Tableau de bord | ${APP_NAME}`;
  }, []);

  const { auth, logout } = useContext(AuthContext);
  const userName = auth.profile?.nomUtilisateur || auth.userName;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        if (mounted) setEvents(data);
      } catch (error) {
        console.error("Erreur lors du chargement des événements :", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEvents();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCreate = async (newEvent) => {
    try {
      await createEvent(newEvent);
      const data = await fetchEvents();
      setEvents(data);
      setShowModal(false);
    } catch (error) {
      console.error("Impossible de créer l'événement :", error);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header" id='dashboard-header'>
        <h1 className="dashboard-brand">{APP_NAME}</h1>
        <div className="dashboard-user">
          <span className="dashboard-username">{userName}</span>
          <button className="dashboard-button" onClick={() => navigate('/profile')}>
            Mon profil
          </button>
          <button className="dashboard-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <h2 className="dashboard-section-title">Mes événements</h2>
          <button className="dashboard-create-button" onClick={() => setShowModal(true)}>
            + Nouvel événement
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Chargement des événements...</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            Vous n'avez encore organisé aucun événement.
          </div>
        ) : (
          <div className="events-grid">
            {events.map((ev) => (
              <Link
                key={ev.id}
                to={`/event/${ev.id}`}
                className="event-card-link"
              >
                <article className="event-card">
                  {ev.cover ? (
                    <img className="event-cover" src={ev.cover} alt={ev.name} />
                  ) : (
                    <div className="event-cover event-cover-empty">Aucune image</div>
                  )}
                  <div className="event-body">
                    <h3 className="event-name">{ev.name}</h3>
                    <p className="event-meta">{ev.date}</p>
                    <p className="event-meta">{ev.location}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <EventModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />
      )}

    </div>
  );
}

export const EventModal = ({ onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState(initialData || emptyEvent);
  const [error, setError] = useState("");

  const isEdit = Boolean(initialData);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Le nom de l'événement est requis");
    if (!form.date) return setError("La date est requise");
    if (!form.location.trim()) return setError("Le lieu est requis");
    if (!form.description.trim()) return setError("La description est requise");
    onSubmit(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? "Modifier l'événement" : "Nouvel événement"}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>

          <div className="modal-field">
            <label className="modal-label">Nom de l'événement</label>
            <input
              type="text"
              className="modal-input"
              value={form.name}
              onChange={update("name")}
              maxLength={100}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Date</label>
            <input type="date" className="modal-input" value={form.date} onChange={update("date")} required />
          </div>

          <div className="modal-field">
            <label className="modal-label">Lieu</label>
            <input
              type="text"
              className="modal-input"
              value={form.location}
              onChange={update("location")}
              maxLength={50}
              required
            />
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea className="modal-textarea" value={form.description} onChange={update("description")} required />
          </div>

          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="modal-button modal-button-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="modal-button modal-button-primary">
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const DeleteConfirmModal = ({ onCancel, onConfirm,toDelete }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Confirmer la suppression</h2>
        <p className="modal-confirm-text">
          {`Voulez-vous vraiment supprimer cet ${toDelete} ?`}
        </p>
        <div className="modal-actions">
          <button className="modal-button modal-button-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="modal-button modal-button-danger" onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;