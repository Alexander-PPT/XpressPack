import { Link } from 'react-router-dom';

export default function SideNav() {
  return (
    <aside className="side-nav">
      <div className="side-title">
        <span>Panel</span>
      </div>
      <nav>
        <Link to="/app">Dashboard</Link>
        <Link to="/app/envios">Envios</Link>
        <Link to="/app/reportes">Reportes</Link>
        <Link to="/app/usuarios">Usuarios</Link>
        <Link to="/app/sucursales">Sucursales</Link>
      </nav>
    </aside>
  );
}
