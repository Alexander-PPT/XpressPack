import { Navigate } from 'react-router-dom';
import { getToken } from '../services/storageService';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = getToken();
  const { user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user && user.rol !== requiredRole) {
    // Si se requiere un rol específico y el usuario no lo tiene, denegar acceso
    return <Navigate to="/app" replace />;
  }

  return children;
}
