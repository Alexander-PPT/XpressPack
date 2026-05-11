import { Route, Routes, Navigate } from 'react-router-dom';
import TrackingPage from './pages/TrackingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ShipmentsPage from './pages/ShipmentsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SucursalesPage from './pages/SucursalesPage';
import DetalleEnvioPage from './pages/DetalleEnvioPage';
import RegistroEnvioPage from './pages/RegistroEnvioPage';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

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
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="envios" element={<ShipmentsPage />} />
        <Route path="envios/nuevo" element={<RegistroEnvioPage />} />
        <Route path="envios/:id" element={<DetalleEnvioPage />} />
        <Route path="reportes" element={<ReportsPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="sucursales" element={<SucursalesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/tracking" replace />} />
    </Routes>
  );
}

export default App;
