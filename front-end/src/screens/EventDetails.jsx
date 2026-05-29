import React from 'react'
import { useState } from "react";
import "./login.css";
import "./dashboard.css";
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEvents, updateEvent, deleteEvent, addGate, removeGate } from "../lib/eventStore";
import { EventModal, DeleteConfirmModal } from "./Dashboard";

function formatPrice(n) {
  if (n === "" || n === null || n === undefined || isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-FR").format(Number(n)) + " Ar";
}

function batteryFor(gateId) {
  const levels = [87, 64, 42, 21, 95];
  return levels[(gateId - 1) % levels.length];
}

function batteryClass(level) {
  if (level > 60) return "battery-high";
  if (level > 25) return "battery-mid";
  return "battery-low";
}

function GateModal({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Le nom est requis");
    if (price === "" || isNaN(Number(price)) || Number(price) < 0)
      return setError("Tarif invalide");
    if (!deviceCode.trim()) return setError("Le code du dispositif est requis");
    onSubmit({ name: name.trim(), price: Number(price), deviceCode: deviceCode.trim() });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Nouvelle entrée</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Nom de l'entrée</label>
            <input
              type="text"
              className="modal-input"
              placeholder="VIP, Standard…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Tarif (Ar)</label>
            <input
              type="number"
              min="0"
              className="modal-input"
              placeholder="ex. 15000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Code du dispositif (licence)</label>
            <input
              type="text"
              className="modal-input"
              placeholder="ex. SM-001"
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
              required
            />
            <p className="modal-hint">
              Code unique du compteur électronique associé à cette entrée.
            </p>
          </div>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="modal-button modal-button-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="modal-button modal-button-primary">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


const EventDetails = () => {
  const params = useParams();
  const eventId = params.eventId;
  const navigate = useNavigate();
  const events = useEvents();
  const event = events.find((e) => String(e.id) === String(eventId));

  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [addingGate, setAddingGate] = useState(false);

  if (!event) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <Link to="/dashboard" className="dashboard-brand">EventTrack</Link>
        </header>
        <main className="dashboard-main">
          <div className="empty-state">
            Événement introuvable.{" "}
            <Link to="/dashboard" className="details-back-link">Retour</Link>
          </div>
        </main>
      </div>
    );
  }



  const gates = event.gates || [];
  const totalEntries = gates.reduce((s, g) => s + (Number(g.count) || 0), 0);
  const totalRevenue = gates.reduce(
    (s, g) => s + (Number(g.count) || 0) * (Number(g.price) || 0),
    0
  );

  const handleUpdate = (updated) => {
    updateEvent({ ...updated, gates: event.gates });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteEvent(event.id);
    navigate({ to: "/dashboard" });
  };

  const handleAddGate = (gate) => {
    addGate(event.id, gate);
    setAddingGate(false);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/dashboard" className="dashboard-brand">EventTrack</Link>
      </header>

      <main className="dashboard-main">
        <Link to="/dashboard" className="details-back-link">← Retour aux événements</Link>

        <article className="details-card">
          <img className="details-cover" src={event.cover} alt={event.name} />

          <div className="details-body">
            <div className="details-head">
              <h1 className="details-title">{event.name}</h1>
              <div className="event-actions details-actions">
                <button
                  className="event-action-button event-action-edit"
                  onClick={() => setEditing(true)}
                >
                  Modifier
                </button>
                <button
                  className="event-action-button event-action-delete"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Supprimer
                </button>
              </div>
            </div>

            <p className="details-meta">{event.date} • {event.time}</p>
            <p className="details-meta">{event.location}</p>
            <p className="details-description">{event.description}</p>
          </div>
        </article>

        {/* Les entrees */}
        <section className="details-section">
          <div className="details-section-header">
            <h2 className="details-section-title">Les entrees</h2>
            <button
              className="dashboard-create-button"
              onClick={() => setAddingGate(true)}
            >
              + Ajouter une entrée
            </button>
          </div>
          {gates.length === 0 ? (
            <p className="gates-empty">Aucune entrée définie</p>
          ) : (
            <div className="price-grid">
              {gates.map((g) => (
                <div key={g.id} className="price-card">
                  <div className="price-card-head">
                    <span className="price-card-name">{g.name}</span>
                    <button
                      className="gate-remove-button"
                      onClick={() => removeGate(event.id, g.id)}
                      aria-label="Supprimer l'entrée"
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <span className="price-card-price">{formatPrice(g.price)}</span>
                  {g.deviceCode && (
                    <span className="price-card-device">Dispositif&nbsp;: {g.deviceCode}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2 — Affluence par entrée */}
        <section className="details-section">
          <h2 className="details-section-title">Passage par entrée</h2>

          {gates.length === 0 ? (
            <p className="gates-empty">Aucune entrée définie</p>
          ) : (
            <div className="count-grid">
              {gates.map((g) => (
                <div key={g.id} className="count-card">
                  <div className="count-card-head">
                    <span className="count-card-name">{g.name}</span>
                  </div>

                  <span className="count-card-value">
                    {g.count || 0}
                  </span>

                  <span className="count-card-label">
                    personnes enregistrées
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3 — Suivi en direct */}
        <section className="details-section">
          <h2 className="details-section-title">Suivi en direct</h2>

          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Total des personnes</span>
              <span className="summary-value">{totalEntries}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Montant total généré</span>
              <span className="summary-value">{formatPrice(totalRevenue)}</span>
            </div>
          </div>

          {/* Niveau de batterie */}
          <h2 className="details-section-title">Niveau de batterie</h2>
          {gates.length === 0 ? (
            <p className="gates-empty">Aucune dispositif disponible</p>
          ) : (
            <ul className="battery-list">
              {gates.map((g) => {
                const lvl = batteryFor(g.id);
                return (
                  <li key={g.id} className="battery-row">
                    <div className="battery-info">
                      <span className="battery-name">{g.name}</span>
                      {g.deviceCode && (
                        <span className="battery-device">{g.deviceCode}</span>
                      )}
                    </div>
                    <div className="battery-bar">
                      <div
                        className={`battery-fill ${batteryClass(lvl)}`}
                        style={{ width: `${lvl}%` }}
                      />
                    </div>
                    <span className="battery-value">{lvl}%</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {editing && (
        <EventModal
          onClose={() => setEditing(false)}
          onSubmit={handleUpdate}
          initialData={event}
        />
      )}

      {addingGate && (
        <GateModal
          onClose={() => setAddingGate(false)}
          onSubmit={handleAddGate}
        />
      )}

      {confirmingDelete && (
        <DeleteConfirmModal
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

export default EventDetails;
