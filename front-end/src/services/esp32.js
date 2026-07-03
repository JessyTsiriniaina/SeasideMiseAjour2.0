import axiosInstance from "../api/axios";

const registerMaster = async (master) => {
  const response = await axiosInstance.post("/esp32/masters", {
    adresseMac: master.adresseMac,
    nom: master.nom,
    evenementId: master.evenementId,
  });
  return response.data;
};

const associateSlave = async (masterId, payload) => {
  const response = await axiosInstance.post(`/esp32/masters/${masterId}/slaves`, payload);
  return response.data;
};

const sendConfig = async (masterId) => {
  return axiosInstance.post(`/esp32/masters/${masterId}/config/envoyer`);
};

export { registerMaster, associateSlave, sendConfig };