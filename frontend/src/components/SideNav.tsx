import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SideNav() {
  const { user, logout } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  return (
    <aside className="side-nav">
      <div className="side-title">
        <span>Panel</span>
      </div>
      <nav>
        <Link to="/app">Dashboard</Link>
        <Link to="/app/envios">Envios</Link>
        {isAdmin && (
          <>
            <Link to="/app/reportes">Reportes</Link>
            <Link to="/app/usuarios">Usuarios</Link>
            <Link to="/app/sucursales">Sucursales</Link>
          </>
        )}
        <button onClick={logout} className="ghost" style={{ marginTop: '24px' }}>Cerrar Sesión</button>
      </nav>
    </aside>
  );
}
