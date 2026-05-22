import React from 'react'
import { useState } from 'react';
import "./login.css";
import "./dashboard.css";

const initialEvents = [
  {
    id: 1,
    name: "Concert de printemps",
    date: "06-12-2026",
    time: "20:00",
    location: "Tamatavy 501",
    description: "Un concert en plein air pour célébrer le début de la saison.",
    cover: "party.jpeg",
  },
  {
    id: 2,
    name: "Conférence Tech 2026",
    date: "07-03-2026",
    time: "09:00",
    location: "Arena Toamasina",
    description: "Une journée dédiée aux dernières innovations technologiques.",
    cover: "conference.jpeg",
  },
];

const userName = "Jessy Tsiriniaina"

const Dashboard = () => {
  const [events, setEvents] = useState(initialEvents);

  const handleLogout = () => {
    navigate({ to: "/login" });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header" id='dashboard-header'>
        <h1 className="dashboard-brand">EventTrack</h1>
        <div className="dashboard-user">
          <span className="dashboard-username">{userName}</span>
          <button className="dashboard-logout" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <h2 className="dashboard-section-title">Mes événements</h2>
          <button className="dashboard-create-button">
            + Nouvel événement
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            Vous n'avez encore organisé aucun événement.
          </div>
        ) : (
          <div className="events-grid">
            {events.map((ev) => (
              <article key={ev.id} className="event-card">
                <img className="event-cover" src={ev.cover} alt={ev.name} />
                <div className="event-body">
                  <h3 className="event-name">{ev.name}</h3>
                  <p className="event-meta">{ev.date} • {ev.time}</p>
                  <p className="event-meta">{ev.location}</p>
                  <p className="event-description">{ev.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


export default Dashboard