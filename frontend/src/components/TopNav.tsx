import { Link } from 'react-router-dom';

export default function TopNav() {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-16">
      <div className="font-display text-xl font-bold">RutaSync</div>
      <nav className="hidden gap-6 md:flex">
        <Link className="text-sm font-semibold text-ink/80" to="/tracking">Tracking</Link>
        <Link className="text-sm font-semibold text-ink/80" to="/login">Panel</Link>
      </nav>
      <div>
        <a
          className="btn-ghost"
          href="mailto:contacto@rutasync.com"
        >
          Contacto
        </a>
      </div>
    </header>
  );
}
