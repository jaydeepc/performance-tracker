import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'manager' | 'reportee';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on user role
    const dashboardRoutes = {
      admin: '/admin',
      manager: '/manager',
      reportee: '/reportee',
    };
    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
