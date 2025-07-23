import React, { useEffect } from "react";
import NavBar from "./NavBar";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "../higherOrderComponent/ProtectedRoute";

const MainElement = () => {
 const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
   if (location.pathname === "/") {
      navigate("/home");
    }
  }, [location.pathname, navigate]);
  
  return (
    <ProtectedRoute>
      <div className="flex ">
        <NavBar />
        <Outlet />
      </div>
    </ProtectedRoute>
  );
};

export default MainElement;
