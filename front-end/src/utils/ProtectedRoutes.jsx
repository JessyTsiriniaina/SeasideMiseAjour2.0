import { Outlet, Navigate } from 'react-router-dom';
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const payload = parseJwt(token);
  return Boolean(payload?.exp && payload.exp * 1000 > Date.now());
};

const ProtectedRoutes = () => {
  const { auth } = useContext(AuthContext);
  const user = !!auth.userName && !!auth.accessToken && isTokenValid(auth.accessToken);
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes