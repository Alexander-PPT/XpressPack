import { Link } from 'react-router-dom';

export default function TopNav() {
  return (
    <header className="top-nav">
      <div className="logo">
        <span>RutaSync</span>
      </div>
      <nav>
        <Link to="/tracking">Tracking</Link>
        <Link to="/login">Panel</Link>
      </nav>
      <div className="nav-actions">
        <a className="ghost" href="mailto:contacto@rutasync.com">Contacto</a>
      </div>
    </header>
  );
}
