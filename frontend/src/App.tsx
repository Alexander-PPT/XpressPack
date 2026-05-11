import { Route, Routes, Navigate } from 'react-router-dom';
import TrackingPage from './pages/TrackingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ShipmentsPage from './pages/ShipmentsPage';
import RegistroEnvioPage from './pages/RegistroEnvioPage';
import DetalleEnvioPage from './pages/DetalleEnvioPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SucursalesPage from './pages/SucursalesPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tracking" replace />} />
      <Route path="/tracking" element={<TrackingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/envios"
        element={
          <ProtectedRoute>
            <ShipmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/envios/nuevo"
        element={
          <ProtectedRoute>
            <RegistroEnvioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/envios/:id"
        element={
          <ProtectedRoute>
            <DetalleEnvioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/reportes"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/usuarios"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/sucursales"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <SucursalesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/tracking" replace />} />
    </Routes>
  );
}

export default App;
