import { Link } from 'react-router-dom';
import { Package, Mail, ExternalLink } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-clay/30 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4 md:px-16">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-pine" />
          <div>
            <h1 className="font-display text-xl font-bold text-gradient">XpressPack</h1>
            <p className="text-xs text-ink/50">Logistics Management</p>
          </div>
        </div>

        <nav className="hidden gap-8 md:flex items-center">
          <Link
            to="/tracking"
            className="text-sm font-semibold text-ink/70 hover:text-pine transition"
          >
            Tracking
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-ink/70 hover:text-pine transition"
          >
            Panel
          </Link>
          <a
            href="https://github.com/Alexander-PPT/XpressPack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink/70 hover:text-pine transition"
            title="GitHub"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="mailto:contacto@xpresspack.com"
            className="btn btn-ghost btn-sm flex items-center gap-2 hidden md:inline-flex"
          >
            <Mail className="h-4 w-4" />
            Contacto
          </a>
          <button className="btn btn-sm md:hidden">Menú</button>
        </div>
      </div>
    </header>
  );
}
