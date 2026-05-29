import { useSyncExternalStore } from "react";

let events = [
  {
    id: 1,
    name: "Concert de printemps",
    date: "2026-06-12",
    time: "20:00",
    location: "Tamatavy 501",
    description: "Un concert en plein air pour célébrer le début de la saison.",
    cover: "/party.jpeg",
    gates: [
      { id: 1, name: "VIP", price: 50000, count: 24, deviceCode: "SM-001" },
      { id: 2, name: "Standard", price: 15000, count: 132, deviceCode: "SM-002" },
    ],
  },
  {
    id: 2,
    name: "Conférence Tech 2026",
    date: "2026-07-03",
    time: "09:00",
    location: "Arena Toamasina",
    description: "Une journée dédiée aux dernières innovations technologiques.",
    cover: "/conference.jpeg",
    gates: [
      { id: 3, name: "Platinium", price: 120000, count: 8, deviceCode: "SM-003" },
      { id: 4, name: "Pro", price: 60000, count: 45, deviceCode: "SM-004" },
      { id: 5, name: "Étudiant", price: 20000, count: 90, deviceCode: "SM-005" },
    ],
  },
];

const listeners = new Set();
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const emit = () => listeners.forEach((cb) => cb());
const getSnapshot = () => events;

export function useEvents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getEventById(id) {
  return events.find((e) => String(e.id) === String(id));
}

export function addEvent(ev) {
  events = [...events, { ...ev, id: Date.now() }];
  emit();
}

export function updateEvent(ev) {
  events = events.map((e) => (e.id === ev.id ? ev : e));
  emit();
}

export function deleteEvent(id) {
  events = events.filter((e) => e.id !== id);
  emit();
}

export function addGate(eventId, gate) {
  events = events.map((e) =>
    String(e.id) === String(eventId)
      ? { ...e, gates: [...(e.gates || []), { ...gate, id: Date.now(), count: 0 }] }
      : e
  );
  emit();
}

export function removeGate(eventId, gateId) {
  events = events.map((e) =>
    String(e.id) === String(eventId)
      ? { ...e, gates: (e.gates || []).filter((g) => g.id !== gateId) }
      : e
  );
  emit();
}
