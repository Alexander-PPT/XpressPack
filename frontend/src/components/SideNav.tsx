import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { clearSession } from '../services/storageService';

export default function SideNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  return (
    <aside className="bg-clay px-6 py-10">
      <div className="font-display text-lg">Panel</div>
      <nav className="mt-6 grid gap-3 text-sm font-semibold text-ink/70">
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app">Dashboard</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/envios">Envios</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/reportes">Reportes</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/usuarios">Usuarios</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/sucursales">Sucursales</Link>
        <button className="btn-ghost mt-4 text-left" onClick={handleLogout}>Cerrar sesion</button>
      </nav>
    </aside>
  );
}
