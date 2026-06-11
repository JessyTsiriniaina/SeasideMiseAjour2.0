import axiosInstance from "../api/axios";

const fetchUsers = async (accessToken) => {
  const response = await axiosInstance.get("/admin/utilisateurs", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

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

export { fetchUsers, registerUser, updateUser, deleteUser };