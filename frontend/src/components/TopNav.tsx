import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Package } from 'lucide-react';

export default function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-clay/25">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/tracking" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-pine/10 flex items-center justify-center text-pine group-hover:scale-105 transition-transform">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-gradient leading-none">XpressPack</p>
            <p className="text-xs text-ink/50 leading-none mt-1">Logistics Management</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
          <Link to="/tracking" className="hover:text-pine transition-colors">Tracking</Link>
          <Link to="/login" className="hover:text-pine transition-colors">Panel</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login" className="btn btn-primary hidden md:inline-flex">
            Ingresar
          </Link>
          <button
            type="button"
            className="btn btn-sm md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-clay/30 px-6 py-4 space-y-2 bg-white">
          <Link to="/tracking" className="block text-sm font-semibold py-2" onClick={() => setMobileOpen(false)}>
            Tracking
          </Link>
          <Link to="/login" className="block text-sm font-semibold py-2" onClick={() => setMobileOpen(false)}>
            Panel
          </Link>
        </div>
      )}
    </header>
  );
}
