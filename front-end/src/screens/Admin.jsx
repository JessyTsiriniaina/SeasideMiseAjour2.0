import { useState, useContext, useEffect } from "react";
import "./login.css";
import "./dashboard.css";
import "./admin.css";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "../config/config";
import { DeleteConfirmModal, EventModal } from "./Dashboard";
import AuthContext from "../context/AuthProvider";
import Combobox from "../components/Combobox";
import { fetchUsers, registerUser, updateUser as updateUserService, deleteUser as deleteUserService } from "../services/users";
import { fetchEvents as fetchAdminEvents, createEvent, updateEvent, deleteEvent as deleteEventService, activateEvent, deactivateEvent } from "../services/events";
import { registerMaster, associateSlave, sendConfig } from "../services/esp32";

function formatPrice(n) {
  return new Intl.NumberFormat("fr-FR").format(Number(n) || 0) + " Ar";
}

const NAV = [
  { id: "home", label: "Accueil", icon: "M3 11l9-8 9 8v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2V11z" },
  { id: "users", label: "Utilisateurs", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" },
  { id: "devices", label: "Dispositifs", icon: "M9 2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01" },
  { id: "events", label: "Événements", icon: "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" },
];

const Admin = () => {
  const { auth, logout } = useContext(AuthContext);
  const userName = auth.userName;

  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState("");

  const navigate = useNavigate();
  const [section, setSection] = useState("home");
  const [navOpen, setNavOpen] = useState(false);

  const goTo = (id) => {
    setSection(id);
    setNavOpen(false);
  };

  useEffect(() => {
    fetchUsers()
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    const loadEvents = async () => {
      setLoadingEvents(true);
      setEventsError("");
      try {
        const data = await fetchAdminEvents();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsError("Impossible de charger la liste des événements.");
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [auth.accessToken]);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${navOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-head">
          <span className="admin-sidebar-brand">{APP_NAME}</span>
          <span className="admin-sidebar-sub">Administration</span>
        </div>

        <nav className="admin-nav">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item ${section === item.id ? "is-active" : ""}`}
              onClick={() => goTo(item.id)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {navOpen && <div className="admin-overlay" onClick={() => setNavOpen(false)} />}

      <div className="admin-content">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-burger"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            <span /><span /><span />
          </button>
          <h1 className="admin-topbar-title">
            {NAV.find((n) => n.id === section)?.label}
          </h1>
          <div className="admin-topbar-user">
            <span className="dashboard-username">{userName}</span>
            <button className="dashboard-logout" onClick={() => { logout(); navigate("/login"); }}>
              Se déconnecter
            </button>
          </div>
        </header>

        <main className="admin-main">
          {section === "home" && <HomeSection users={users} events={events} loading={loadingEvents} error={eventsError} />}
          {section === "users" && <UsersSection users={users} setUsers={setUsers} />}
          {section === "devices" && <DevicesSection />}
          {section === "events" && <EventsSection events={events} setEvents={setEvents} loading={loadingEvents} error={eventsError} setError={setEventsError} />}
        </main>
      </div>
    </div>
  )
}

const HomeSection = ({ users, events, loading, error }) => {
  const eventCount = () => {
    return events.length;
  };

  return (
    <>
      <section className="admin-stats">
        <StatCard label="Utilisateurs" value={`${users.length}`} />
        <StatCard label="Événements" value={loading ? "..." : `${eventCount()}`} />
        <StatCard label="Dispositifs" value="5" />
        <StatCard label="Personnes comptées" value="210" />
      </section>
      {error && <p className="modal-error" style={{ marginTop: "0.75rem" }}>{error}</p>}
    </>
  );
};

const UsersSection = ({ users, setUsers }) => {
  const { auth } = useContext(AuthContext);
  const [query, setQuery] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.nomUtilisateur || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  const refreshUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error refreshing users:", error);
    }
  };

  const addUser = async (user) => {
    try {
      await registerUser(user);
      await refreshUsers();
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (user) => {
    try {
      await updateUserService(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        estActif: user.status === "Actif",
      });
      await refreshUsers();
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserService(id);
      await refreshUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const handleCreate = async (user) => {
    await addUser(user);
    setCreating(false);
  };

  return (
    <section className="admin-section">
      <div className="admin-section-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="Rechercher par nom, email ou rôle…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="dashboard-create-button" onClick={() => setCreating(true)}>
          + Nouvel utilisateur
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th className="admin-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table-empty">Aucun utilisateur trouvé.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td data-label="Nom">{u.nomUtilisateur}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Rôle">{u.role}</td>
                  <td data-label="Statut">
                    <span className={u.estActif ? "status-pill status-on" : "status-pill status-off"}>
                      {u.estActif ? "Actif" : "Suspendu"}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="admin-row-actions">
                      <button className="admin-link-button" onClick={() => setEditing(u)}>Modifier</button>
                      <button className="admin-link-button admin-link-danger" onClick={() => setDeleting(u)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <UserModal
          onClose={() => setCreating(false)}
          onSubmit={handleCreate}
        />
      )}
      {editing && (
        <UserModal
          initialData={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (u) => { await updateUser(u); setEditing(null); }}
        />
      )}
      {deleting && (
        <DeleteConfirmModal
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            try {
              await deleteUser(deleting.id);
              setDeleting(null);
            } catch (error) {
              console.error("Impossible de supprimer l'utilisateur:", error);
            }
          }}
          toDelete="utilisateur"
        />
      )}
    </section>
  );
}

const DevicesSection = () => {
  const [form, setForm] = useState({ adresseMac: "", nom: "", evenementId: "" });
  const [slaveForm, setSlaveForm] = useState({ masterId: "", slaveId: "", nom: "", categorieId: "" });
  const [masters, setMasters] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState("");
  const [assocError, setAssocError] = useState("");
  const [assocSuccess, setAssocSuccess] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      setEventLoading(true);
      setEventError("");
      try {
        const data = await fetchAdminEvents();
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEventError("Impossible de charger la liste des événements.");
      } finally {
        setEventLoading(false);
      }
    };

    loadEvents();
  }, []);

  const update = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const updateSlave = (field) => (e) => {
    setSlaveForm((current) => ({ ...current, [field]: e.target.value }));
    setAssocError("");
    setAssocSuccess("");
  };

  const selectedEvent = events.find((event) => event.id === form.evenementId) || null;
  const eventOptions = events.map((event) => ({
    value: event.id,
    label: event.name || event.nom || "Événement sans nom",
  }));
  const categoryOptions = (selectedEvent?.categories || []).map((category) => ({
    value: category.id,
    label: category.nom || "Catégorie sans nom",
  }));
  const masterOptions = masters.map((master) => ({
    value: master.id,
    label: master.nom ? `${master.nom} — ${master.adresseMac}` : master.adresseMac,
  }));

  useEffect(() => {
    setSlaveForm((current) => ({
      ...current,
      categorieId: current.categorieId && selectedEvent?.categories?.some((cat) => cat.id === current.categorieId)
        ? current.categorieId
        : "",
    }));
  }, [selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.adresseMac.trim()) return setError("L'adresse MAC est requise.");
    if (!form.evenementId.trim()) return setError("Un événement doit être sélectionné.");

    try {
      const master = await registerMaster({
        adresseMac: form.adresseMac.trim(),
        nom: form.nom.trim(),
        evenementId: form.evenementId.trim(),
      });
      setMasters((current) => [master, ...current]);
      setSlaveForm((current) => ({ ...current, masterId: master.id }));
      setSuccess("Master ESP32 enregistré avec succès.");
      setForm({ adresseMac: "", nom: "", evenementId: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Impossible d'enregistrer le master.");
    }
  };

  const handleSendConfig = async (masterId) => {
    setError("");
    setSuccess("");
    try {
      await sendConfig(masterId);
      setSuccess("Configuration envoyée au firmware.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Impossible d'envoyer la configuration.");
    }
  };

  const handleAssociateSlave = async (e) => {
    e.preventDefault();
    setAssocError("");
    setAssocSuccess("");

    if (!slaveForm.masterId.trim()) return setAssocError("Un master doit être sélectionné.");
    if (!slaveForm.slaveId.trim() || Number(slaveForm.slaveId) < 1) return setAssocError("Le numéro du slave est requis et doit être >= 1.");
    if (!slaveForm.categorieId.trim()) return setAssocError("Une catégorie doit être sélectionnée.");

    try {
      await associateSlave(slaveForm.masterId.trim(), {
        slaveId: Number(slaveForm.slaveId),
        nom: slaveForm.nom.trim() || undefined,
        categorieId: slaveForm.categorieId.trim(),
      });
      setAssocSuccess("Slave associé avec succès.");
      setSlaveForm({ masterId: "", slaveId: "", nom: "", categorieId: "" });
    } catch (err) {
      setAssocError(err?.response?.data?.message || err?.message || "Impossible d'associer le slave.");
    }
  };

  return (
    <section className="admin-section">
      <div className="admin-section-toolbar">
        <h2 className="admin-section-title">Gestion des dispositifs</h2>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="modal-row">
          <div className="modal-field">
            <label className="modal-label">Adresse MAC</label>
            <input
              className="modal-input"
              value={form.adresseMac}
              onChange={update("adresseMac")}
              placeholder="AA:BB:CC:DD:EE:FF"
              required
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Nom du master</label>
            <input
              className="modal-input"
              value={form.nom}
              onChange={update("nom")}
              placeholder="Master Entrée Principale"
            />
          </div>
          <Combobox
            label="Événement"
            name="evenementId"
            value={form.evenementId}
            options={eventOptions}
            onChange={update("evenementId")}
            placeholder={eventLoading ? "Chargement des événements..." : "Sélectionner un événement"}
            loading={eventLoading}
            required
            error={eventError}
          />
        </div>

        {error && <p className="modal-error">{error}</p>}
        {success && <p className="modal-success">{success}</p>}

        <div className="modal-actions">
          <button
            type="submit"
            className="modal-button modal-button-primary"
            disabled={!form.adresseMac.trim() || !form.evenementId}
          >
            Enregistrer le master ESP32
          </button>
        </div>
      </form>

      <form className="admin-form" onSubmit={handleAssociateSlave} style={{ marginTop: "1.5rem" }}>
        <div className="modal-row">
          <Combobox
            label="Master"
            name="masterId"
            value={slaveForm.masterId}
            options={masterOptions}
            onChange={updateSlave("masterId")}
            placeholder={masterOptions.length > 0 ? "Sélectionner un master" : "Aucun master disponible"}
            disabled={masterOptions.length === 0}
            required
            emptyText="Enregistrez d’abord un master pour pouvoir l’associer."
          />
          <div className="modal-field">
            <label className="modal-label">Numéro du slave</label>
            <input
              className="modal-input"
              type="number"
              min="1"
              value={slaveForm.slaveId}
              onChange={updateSlave("slaveId")}
              placeholder="1"
              required
            />
          </div>
          <div className="modal-field">
            <label className="modal-label">Nom du slave</label>
            <input
              className="modal-input"
              value={slaveForm.nom}
              onChange={updateSlave("nom")}
              placeholder="Slave Porte VIP"
            />
          </div>
          <Combobox
            label="Catégorie"
            name="categorieId"
            value={slaveForm.categorieId}
            options={categoryOptions}
            onChange={updateSlave("categorieId")}
            placeholder={selectedEvent ? "Sélectionner une catégorie" : "Sélectionnez d’abord un événement"}
            disabled={!selectedEvent || categoryOptions.length === 0}
            required
            emptyText="Aucune catégorie disponible pour cet événement."
          />
        </div>

        {assocError && <p className="modal-error">{assocError}</p>}
        {assocSuccess && <p className="modal-success">{assocSuccess}</p>}

        <div className="modal-actions">
          <button
            type="submit"
            className="modal-button modal-button-secondary"
            disabled={!slaveForm.masterId || !slaveForm.slaveId || Number(slaveForm.slaveId) < 1 || !slaveForm.categorieId}
          >
            Associer le slave
          </button>
        </div>
      </form>

      {masters.length > 0 && (
        <div className="admin-table-wrap" style={{ marginTop: "1rem" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>MAC</th>
                <th>Nom</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {masters.map((master) => (
                <tr key={master.id}>
                  <td>{master.id}</td>
                  <td>{master.adresseMac}</td>
                  <td>{master.nom || "-"}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-link-button"
                      onClick={() => handleSendConfig(master.id)}
                    >
                      Envoyer config
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const EventsSection = ({ events, setEvents, loading, error, setError }) => {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [query, setQuery] = useState("");

  const refreshEvents = async () => {
    try {
      const data = await fetchAdminEvents();
      setEvents(data);
      if (setError) setError("");
    } catch (error) {
      console.error("Error refreshing events:", error);
      if (setError) setError("Impossible de charger la liste des événements.");
    }
  };

  const handleCreate = async (event) => {
    try {
      await createEvent(event);
      await refreshEvents();
      setCreating(false);
    } catch (error) {
      console.error("Error creating event:", error);
      if (setError) setError(error?.response?.data?.message || error?.message || "Impossible de créer l'événement.");
      throw error;
    }
  };

  const handleUpdate = async (event) => {
    try {
      await updateEvent(event.id, event);
      await refreshEvents();
      setEditing(null);
    } catch (error) {
      console.error("Error updating event:", error);
      if (setError) setError(error?.response?.data?.message || error?.message || "Impossible de modifier l'événement.");
      throw error;
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await deleteEventService(eventId);
      await refreshEvents();
      setDeleting(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      if (setError) setError(error?.response?.data?.message || error?.message || "Impossible de supprimer l'événement.");
      throw error;
    }
  };

  const handleToggleActivate = async (eventId, active) => {
    try {
      if (active) {
        await deactivateEvent(eventId);
      } else {
        await activateEvent(eventId);
      }
      await refreshEvents();
    } catch (error) {
      console.error("Error toggling event activation:", error);
      if (setError) setError(error?.response?.data?.message || error?.message || "Impossible de changer le statut de l'événement.");
    }
  };

  const filteredEvents = events.filter((event) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (event.name || "").toLowerCase().includes(q) ||
      (event.location || "").toLowerCase().includes(q) ||
      (event.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="admin-section">
      <div className="admin-section-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="Rechercher un événement..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="dashboard-create-button" onClick={() => setCreating(true)}>
          + Nouvel événement
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Date</th>
              <th>Lieu</th>
              <th>Statut</th>
              <th className="admin-table-actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="admin-table-empty">Chargement des événements...</td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table-empty">
                  Aucun événement trouvé.
                  <div style={{ marginTop: "0.5rem" }}>
                    <button type="button" className="admin-link-button" onClick={() => refreshEvents()}>
                      Réessayer
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td data-label="Nom">{event.name}</td>
                  <td data-label="Date">{event.date}</td>
                  <td data-label="Lieu">{event.location}</td>
                  <td data-label="Statut">
                    <span className={event.estActif ? "status-pill status-on" : "status-pill status-off"}>
                      {event.estActif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="admin-row-actions">
                      <button className="admin-link-button" onClick={() => setEditing(event)}>
                        Modifier
                      </button>
                      <button className="admin-link-button" onClick={() => handleToggleActivate(event.id, event.estActif)}>
                        {event.estActif ? "Désactiver" : "Activer"}
                      </button>
                      <button className="admin-link-button admin-link-danger" onClick={() => setDeleting(event)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating && (
        <EventModal
          onClose={() => setCreating(false)}
          onSubmit={handleCreate}
        />
      )}

      {editing && (
        <EventModal
          initialData={editing}
          onClose={() => setEditing(null)}
          onSubmit={handleUpdate}
        />
      )}

      {deleting && (
        <DeleteConfirmModal
          onCancel={() => setDeleting(null)}
          onConfirm={async () => handleDelete(deleting.id)}
          toDelete="événement"
        />
      )}
    </section>
  );
};


function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}


function UserModal({ onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(
    initialData
      ? {
        id: initialData.id || null,
        name: initialData.nomUtilisateur || initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "CLIENT",
        status: initialData.estActif ? "Actif" : "Suspendu",
        password: "",
        passwordConfirm: "",
      }
      : { id: null, name: "", email: "", role: "CLIENT", status: "Actif", password: "", passwordConfirm: "" }
  );
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Le nom est requis");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Email invalide");

    if (!isEdit) {
      if (!form.password.trim()) return setError("Le mot de passe est requis");
      if (form.password !== form.passwordConfirm) return setError("Les mots de passe ne correspondent pas");
    }

    setError("");

    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Une erreur est survenue";
      setError(message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-field">
            <label className="modal-label">Nom complet</label>
            <input className="modal-input" value={form.name} onChange={update("name")} required />
          </div>
          <div className="modal-field">
            <label className="modal-label">Email</label>
            <input type="email" className="modal-input" value={form.email} onChange={update("email")} required />
          </div>

          {!initialData && (
            <>
              <div className="modal-field">
                <label className="modal-label">Mot de passe</label>
                <input className="modal-input" type="password" value={form.password} onChange={update("password")} required />
              </div>
              <div className="modal-field">
                <label className="modal-label">Confirmer le mot de passe</label>
                <input className="modal-input" type="password" value={form.passwordConfirm} onChange={update("passwordConfirm")} required />
              </div>
            </>
          )}
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Rôle</label>
              <select className="modal-input" value={form.role} onChange={update("role")}>
                <option value="CLIENT">Client</option>
                <option value="ADMIN">Admin</option>
                <option value="COMPTOIRE">Comptoire</option>
              </select>
            </div>
            <div className="modal-field">
              <label className="modal-label">Statut</label>
              <select className="modal-input" value={form.status} onChange={update("status")}>
                <option>Actif</option>
                <option>Suspendu</option>
              </select>
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="modal-button modal-button-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="modal-button modal-button-primary">{isEdit ? "Enregistrer" : "Créer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Admin