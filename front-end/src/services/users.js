import axiosInstance from "../api/axios";

const fetchUsers = async () => {
  const response = await axiosInstance.get("/admin/utilisateurs");
  return response.data;
};

const registerUser = async (user) => {
  const payload = {
    nomUtilisateur: user.name,
    email: user.email,
    motDePasse: user.password,
    role: user.role ? user.role.toUpperCase() : undefined,
  };

  const response = await axiosInstance.post("/auth/register", payload);
  return response.data;
};

const updateUser = async (id, user) => {
  const payload = {
    nomUtilisateur: user.name,
    email: user.email,
    role: user.role ? user.role.toUpperCase() : undefined,
    estActif: user.estActif,
  };
  const response = await axiosInstance.put(`/admin/utilisateurs/${id}`, payload);
  return response.data;
};

const deleteUser = async (id) => {
  return axiosInstance.delete(`/admin/utilisateurs/${id}`);
};

const fetchProfile = async () => {
  const response = await axiosInstance.get("/utilisateurs/moi");
  return response.data;
};

const updateProfile = async (profile) => {
  const payload = {
    nomUtilisateur: profile.name,
    email: profile.email,
  };
  const response = await axiosInstance.put("/utilisateurs/moi", payload);
  return response.data;
};

const changePassword = async ({ oldPassword, newPassword, confirmation }) => {
  const payload = {
    ancienMotDePasse: oldPassword,
    nouveauMotDePasse: newPassword,
    confirmation,
  };
  const response = await axiosInstance.patch("/utilisateurs/moi/mot-de-passe", payload);
  return response.data;
};

export { fetchUsers, registerUser, updateUser, deleteUser, fetchProfile, updateProfile, changePassword };