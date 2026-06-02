import {Outlet, Navigate} from 'react-router-dom'
import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

const ProtectedRoutes = () => {
  const { auth } = useContext(AuthContext);
  const user = !!auth.userName;
  return (
    user ? <Outlet/> : <Navigate to="/login"/>
  )
}

export default ProtectedRoutes