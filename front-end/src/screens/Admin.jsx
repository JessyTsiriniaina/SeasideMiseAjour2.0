import { useState, useContext, useEffect } from "react";
import "./login.css";
import "./dashboard.css";
import "./admin.css";
import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "../config/config";
import { DeleteConfirmModal } from "./Dashboard";
import AuthContext from "../context/AuthProvider";
import { fetchUsers, registerUser } from "../services/users";

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

  const navigate = useNavigate();
  const [section, setSection] = useState("home");
  const [navOpen, setNavOpen] = useState(false);

  const goTo = (id) => {
    setSection(id);
    setNavOpen(false);
  };

  useEffect(() => {
    fetchUsers(auth.accessToken)
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
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
          {section === "home" && <HomeSection users={users} setUsers={setUsers} />}
          {section === "users" && <UsersSection users={users} setUsers={setUsers} />}
          {section === "devices" && <DevicesSection />}
          {section === "events" && <EventsSection />}
        </main>
      </div>
    </div>
  )
}

const HomeSection = ({ users, setUsers }) => {
  const eventCount = () => {
    return users.reduce((acc, u) => acc + (u.nombreEvenements ? u.nombreEvenements : 0), 0);
  }
  return (
    <>
      <section className="admin-stats">
        <StatCard label="Utilisateurs" value={`${users.length}`} />
        <StatCard label="Événements" value={`${eventCount()}`} />
        <StatCard label="Dispositifs" value="5" />
        <StatCard label="Personnes comptées" value="210" />
      </section>
    </>
  )
}

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
      const data = await fetchUsers(auth.accessToken);
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
    console.warn("updateUser is not implemented yet", user);
  };

  const deleteUser = async (id) => {
    console.warn("deleteUser is not implemented yet", id);
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
          onConfirm={() => { deleteUser(deleting.id); setDeleting(null); }}
          toDelete="utilisateur"
        />
      )}
    </section>
  );
}

const DevicesSection = () => {
  return (
    <h2>Gestion des dispositifs</h2>
  )
}

const EventsSection = () => {
  return (
    <h2>Gestion des événements</h2>
  )
}


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
        role: initialData.role || "",
        status: initialData.estActif ? "Actif" : "Suspendu",
        password: "",
        passwordConfirm: "",
      }
      : { id: null, name: "", email: "", role: "", status: "", password: "", passwordConfirm: "" }
  );
  const [error, setError] = useState("");
  const isEdit = Boolean(initialData);
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Le nom est requis");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Email invalide");
    if (!form.password.trim()) return setError("Le mot de passe est requis");
    if (form.password !== form.passwordConfirm) return setError("Les mots de passe ne correspondent pas");
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
                <option>Client</option>
                <option>Admin</option>
                <option>Comptoire</option>
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