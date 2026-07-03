import axiosInstance from "../api/axios";

const mapEvent = (event) => ({
  id: event.id,
  name: event.nom,
  date: event.dateEvenement,
  location: event.lieu || "",
  description: event.description || "",
  cover: event.cover || "",
  capaciteMaximale: event.capaciteMaximale || 0,
  estActif: event.estActif ?? true,
  categories: event.categories || [],
  gates: (event.categories || []).map((categorie) => ({
    id: categorie.id,
    name: categorie.nom,
    price: categorie.prix ? Number(categorie.prix) : 0,
    count: categorie.nombreEntrees ?? 0,
    deviceCode: categorie.couleur || "",
  })),
});

export const fetchEvents = async () => {
  const response = await axiosInstance.get("/evenements");
  return response.data.map(mapEvent);
};

export const fetchAdminEvents = fetchEvents;

export const fetchEventById = async (id) => {
  const response = await axiosInstance.get(`/evenements/${id}/dashboard`);
  return mapEvent(response.data);
};

export const createEvent = async (event) => {
  const payload = {
    nom: event.name,
    dateEvenement: event.date,
    lieu: event.location,
    description: event.description,
    capaciteMaximale: event.capaciteMaximale || 0,
  };

  const response = await axiosInstance.post("/evenements", payload);
  return mapEvent(response.data);
};

export const updateEvent = async (id, event) => {
  const payload = {
    nom: event.name,
    dateEvenement: event.date,
    lieu: event.location,
    description: event.description,
    capaciteMaximale: event.capaciteMaximale || 0,
  };

  const response = await axiosInstance.put(`/evenements/${id}`, payload);
  return mapEvent(response.data);
};
export const activateEvent = async (id) => {
  const response = await axiosInstance.patch(`/evenements/${id}/activer`);
  return mapEvent(response.data);
};

export const deactivateEvent = async (id) => {
  const response = await axiosInstance.patch(`/evenements/${id}/desactiver`);
  return mapEvent(response.data);
};

export const deleteEvent = async (id) => {
  return axiosInstance.delete(`/evenements/${id}`);
};

export const addGate = async (eventId, gate) => {
  await axiosInstance.post(`/evenements/${eventId}/categories`, {
    nom: gate.name,
    prix: gate.price,
    capacite: 0,
    couleur: gate.deviceCode || "",
  });
  return fetchEventById(eventId);
};

export const addManualEntry = async (eventId, entry) => {
  await axiosInstance.post(`/evenements/${eventId}/entrees`, {
    categorieId: entry.categoryId,
    comptage: entry.count,
    source: entry.source || "manuel",
  });
  return fetchEventById(eventId);
};

export const fetchEsp32Dashboard = async (eventId) => {
  const response = await axiosInstance.get(`/esp32/evenements/${eventId}/dashboard`);
  return response.data;
};

export const removeGate = async (eventId, gateId) => {
  await axiosInstance.delete(`/evenements/${eventId}/categories/${gateId}`);
  return fetchEventById(eventId);
};

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    setLoading(true);
    try {
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await fetchEvents();
        if (active) setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { events, loading, reload };
};
