import { Link } from 'react-router-dom';

export default function SideNav() {
  return (
    <aside className="bg-clay px-6 py-10">
      <div className="font-display text-lg">Panel</div>
      <nav className="mt-6 grid gap-3 text-sm font-semibold text-ink/70">
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app">Dashboard</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/envios">Envios</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/reportes">Reportes</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/usuarios">Usuarios</Link>
        <Link className="rounded-lg bg-white/70 px-3 py-2" to="/app/sucursales">Sucursales</Link>
      </nav>
    </aside>
  );
}
