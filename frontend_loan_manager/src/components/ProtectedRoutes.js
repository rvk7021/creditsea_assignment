// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  if (!isAuthenticated()) {
    console.log("User is not authenticated");
    return <Navigate to="/"  />;
  }

  const role = getUserRole();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/"  />;
  }
  if(role === 'user') {
    return <Navigate to="/user" />;
  }
  else if(role === 'officer') {
    return <Navigate to="/officer-dashboard" />;
  }
    else if(role === 'admin') {
        return <Navigate to="/admin-dashboard" />;
    }

  return <Component />;
};

export default ProtectedRoute;
