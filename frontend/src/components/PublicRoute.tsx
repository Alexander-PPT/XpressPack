import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../services/storageService';

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const token = getToken();

  if (token) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
