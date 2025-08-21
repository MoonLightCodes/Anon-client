import React, { useEffect } from "react";
import NavBar from "./NavBar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "../higherOrderComponent/ProtectedRoute";

const MainElement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect root path ("/") to "/home"
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full  text-white">
        {/* Sidebar / NavBar */}
        <NavBar />

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MainElement;
