import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: Role[];
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
