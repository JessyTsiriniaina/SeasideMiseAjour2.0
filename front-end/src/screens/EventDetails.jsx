import React, { useState, useEffect, useCallback } from "react";
import "./login.css";
import "./dashboard.css";
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchEventById, updateEvent, deleteEvent, addGate, removeGate, addManualEntry, fetchEsp32Dashboard, activateEvent, deactivateEvent } from "../services/events";
import { EventModal, DeleteConfirmModal } from "./Dashboard";
import { APP_NAME } from '../config/config';
import { useSubscribeToTopic, useWebSocketStatus } from "../utils/useWebSocket";

function formatPrice(n) {
  if (n === "" || n === null || n === undefined || isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-FR").format(Number(n)) + " Ar";
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

function ManualEntryModal({ onClose, onSubmit, categories }) {
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [count, setCount] = useState(1);
  const [source, setSource] = useState("manuel");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryId) return setError("La catégorie est obligatoire");
    if (!count || Number(count) < 1) return setError("Le comptage doit être au moins 1");
    onSubmit({ categoryId, count: Number(count), source: source.trim() || "manuel" });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Ajouter une entrée manuelle</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Catégorie</label>
            <select
              className="modal-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="" disabled>Choisir une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label className="modal-label">Comptage</label>
            <input
              type="number"
              min="1"
              className="modal-input"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              required
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Source</label>
            <input
              type="text"
              className="modal-input"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
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
  const [event, setEvent] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [esp32Dashboard, setEsp32Dashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [addingGate, setAddingGate] = useState(false);
  const [addingEntry, setAddingEntry] = useState(false);
  const isWsConnected = useWebSocketStatus();

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await fetchEventById(eventId);
      setEvent(data);
      const espData = await fetchEsp32Dashboard(eventId);
      setEsp32Dashboard(espData);
    } catch (error) {
      console.error("Erreur lors du chargement de l'événement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTelemetry(null);
    setAlerts([]);
    loadEvent();
  }, [eventId]);

  const handleComptageMessage = useCallback((data) => {
    setEvent((current) => {
      if (!current) return current;
      return {
        ...current,
        gates: current.gates.map((gate) => {
          if (gate.id !== data.categorieId) return gate;
          return {
            ...gate,
            count: Number(data.totalCategorie ?? gate.count) || gate.count,
          };
        }),
      };
    });

    setTelemetry((current) => ({
      ...current,
      totalPersonnes: Number(data.totalEvenement ?? current?.totalPersonnes) || current?.totalPersonnes,
      totalRevenus: Number(data.totalRevenus ?? current?.totalRevenus) || current?.totalRevenus,
    }));
  }, []);

  const handleTelemetryMessage = useCallback((data) => {
    setTelemetry({
      batterieMaster: Number(data.batterieMaster ?? 0),
      masterConnecte: Boolean(data.masterConnecte),
      derniereActiviteMaster: data.derniereActiviteMaster || null,
      totalPersonnes: Number(data.totalPersonnes ?? 0),
      totalRevenus: Number(data.totalRevenus ?? 0),
      slaves: Array.isArray(data.slaves) ? data.slaves : [],
    });
  }, []);

  const handleAlerteMessage = useCallback((data) => {
    setAlerts((current) => [data, ...(current || [])].slice(0, 5));
  }, []);

  useSubscribeToTopic(eventId ? `/topic/comptage/${eventId}` : null, handleComptageMessage);
  useSubscribeToTopic(eventId ? `/topic/telemetrie/${eventId}` : null, handleTelemetryMessage);
  useSubscribeToTopic(eventId ? `/topic/alerte/${eventId}` : null, handleAlerteMessage);

  if (!event) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <Link to="/dashboard" className="dashboard-brand">{APP_NAME}</Link>
        </header>
        <main className="dashboard-main">
          <div className="empty-state">
            {loading ? "Chargement de l'événement..." : (
              <>Événement introuvable. <Link to="/dashboard" className="details-back-link">Retour</Link></>
            )}
          </div>
        </main>
      </div>
    );
  }



  const gates = event.gates || [];
  const totalEntries = telemetry?.totalPersonnes ?? gates.reduce((s, g) => s + (Number(g.count) || 0), 0);
  const totalRevenue = telemetry?.totalRevenus ?? gates.reduce(
    (s, g) => s + (Number(g.count) || 0) * (Number(g.price) || 0),
    0
  );

  const handleUpdate = async (updated) => {
    await updateEvent(event.id, updated);
    await loadEvent();
    setEditing(false);
  };

  const handleActivate = async () => {
    try {
      const activated = await activateEvent(event.id);
      setEvent(activated);
    } catch (error) {
      console.error("Impossible d'activer l'événement :", error);
    }
  };

  const handleDeactivate = async () => {
    try {
      const deactivated = await deactivateEvent(event.id);
      setEvent(deactivated);
    } catch (error) {
      console.error("Impossible de désactiver l'événement :", error);
    }
  };

  const handleDelete = async () => {
    await deleteEvent(event.id);
    navigate("/dashboard");
  };

  const handleAddGate = async (gate) => {
    await addGate(event.id, gate);
    await loadEvent();
    setAddingGate(false);
  };

  const handleAddManualEntry = async (entry) => {
    try {
      await addManualEntry(event.id, entry);
      await loadEvent();
      setAddingEntry(false);
    } catch (error) {
      console.error("Impossible d'ajouter l'entrée manuelle :", error);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/dashboard" className="dashboard-brand">{APP_NAME}</Link>
      </header>

      <main className="dashboard-main">
        <Link to="/dashboard" className="details-back-link">← Retour aux événements</Link>

        <article className="details-card">
          {event.cover ? (
            <img className="details-cover" src={event.cover} alt={event.name} />
          ) : (
            <div className="details-cover details-cover-empty">
              aucune image
            </div>
          )}

          <div className="details-body">
            <div className="details-head">
              <h1 className="details-title">{event.name}</h1>
              <div className="event-meta-group">
                <p className="details-meta">{event.date}</p>
                <p className="details-meta">{event.location}</p>
              </div>
              <div className="event-actions details-actions">
                <button
                  className="event-action-button event-action-edit"
                  onClick={() => setEditing(true)}
                >
                  Modifier
                </button>
                {event.estActif ? (
                  <button
                    className="event-action-button event-action-deactivate"
                    onClick={handleDeactivate}
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    className="event-action-button event-action-activate"
                    onClick={handleActivate}
                  >
                    Activer
                  </button>
                )}
                <button
                  className="event-action-button event-action-delete"
                  onClick={() => setConfirmingDelete(true)}
                >
                  Supprimer
                </button>
              </div>
            </div>

            <p className="details-meta">{event.date}</p>
            <p className="details-meta">{event.location}</p>
            <p className="details-description">{event.description}</p>
          </div>
        </article>

        {/* Les entrees */}
        <section className="details-section">
          <div className="details-section-header">
            <h2 className="details-section-title">Les entrees</h2>
            <div className="details-section-actions">
              <button
                className="dashboard-create-button"
                onClick={() => setAddingGate(true)}
              >
                + Ajouter une entrée
              </button>
              <button
                className="dashboard-create-button dashboard-create-button-secondary"
                onClick={() => setAddingEntry(true)}
              >
                + Ajouter une entrée manuelle
              </button>
            </div>
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
                      onClick={async () => {
                        await removeGate(event.id, g.id);
                        await loadEvent();
                      }}
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

                  <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">WebSocket</span>
              <span className="summary-value">{isWsConnected ? "Connecté" : "Déconnecté"}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Master connecté</span>
              <span className="summary-value">
                {esp32Dashboard ? (esp32Dashboard.masterConnecte ? "Oui" : "Non") : "—"}
              </span>
            </div>
          </div>

          <h2 className="details-section-title">Niveau de batterie</h2>
          {!esp32Dashboard || !esp32Dashboard.slaves || esp32Dashboard.slaves.length === 0 ? (
            <p className="gates-empty">Aucune télémétrie disponible</p>
          ) : (
            <>
              <ul className="battery-list">
                <li className="battery-row battery-row-master">
                  <div className="battery-info">
                    <span className="battery-name">Master</span>
                    <span className="battery-device">{esp32Dashboard.derniereActiviteMaster ? new Date(esp32Dashboard.derniereActiviteMaster).toLocaleString('fr-FR') : "Aucune activité"}</span>
                  </div>
                  <div className="battery-bar">
                    <div
                      className={`battery-fill ${batteryClass(esp32Dashboard.batterieMaster)}`}
                      style={{ width: `${esp32Dashboard.batterieMaster ?? 0}%` }}
                    />
                  </div>
                  <span className="battery-value">{esp32Dashboard.batterieMaster ?? 0}%</span>
                </li>
                {esp32Dashboard.slaves.map((slave) => (
                  <li key={slave.slaveId} className="battery-row">
                    <div className="battery-info">
                      <span className="battery-name">{slave.nom || `Slave ${slave.slaveId}`}</span>
                      <span className="battery-device">{slave.categorieAssociee || "Sans catégorie"}</span>
                    </div>
                    <div className="battery-bar">
                      <div
                        className={`battery-fill ${batteryClass(slave.batterie ?? 0)}`}
                        style={{ width: `${slave.batterie ?? 0}%` }}
                      />
                    </div>
                    <span className="battery-value">{slave.batterie ?? 0}%</span>
                  </li>
                ))}
              </ul>
              {alerts.length > 0 && (
                <section className="details-section">
                  <h2 className="details-section-title">Alertes récentes</h2>
                  <div className="alerts-list">
                    {alerts.map((alert, index) => (
                      <div key={`${alert.code}-${index}`} className={`alert-card alert-${alert.niveau?.toLowerCase()}`}>
                        <div className="alert-message">{alert.message}</div>
                        <div className="alert-meta">{alert.code} • {alert.declencheLe || "—"}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
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

      {addingEntry && (
        <ManualEntryModal
          onClose={() => setAddingEntry(false)}
          onSubmit={handleAddManualEntry}
          categories={event.categories}
        />
      )}

      {confirmingDelete && (
        <DeleteConfirmModal
          onCancel={() => setConfirmingDelete(false)}
          onConfirm={handleDelete}
          toDelete="evenement"
        />
      )}
    </div>
  );
}

export default EventDetails;
