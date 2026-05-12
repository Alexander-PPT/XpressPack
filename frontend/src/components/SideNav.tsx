import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { clearSession } from '../services/storageService';
import { LayoutDashboard, Package, BarChart3, Users, MapPin, LogOut } from 'lucide-react';

export default function SideNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();
      navigate('/login', { replace: true });
    }
  };

  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard', href: '/app' },
    { icon: <Package className="h-5 w-5" />, label: 'Envíos', href: '/app/envios' },
    { icon: <BarChart3 className="h-5 w-5" />, label: 'Reportes', href: '/app/reportes' },
    { icon: <Users className="h-5 w-5" />, label: 'Usuarios', href: '/app/usuarios' },
    { icon: <MapPin className="h-5 w-5" />, label: 'Sucursales', href: '/app/sucursales' },
  ];

  return (
    <aside className="bg-gradient-to-b from-clay/40 to-clay/20 px-4 py-8 md:px-6 md:py-10 flex flex-col h-full">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gradient">XpressPack</h1>
        <p className="text-xs text-ink/50 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 grid gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="nav-link group"
          >
            <span className="text-ink/70 group-hover:text-pine transition">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-clay/40 pt-4">
        <button
          onClick={handleLogout}
          className="nav-link w-full text-left text-error hover:bg-error/5 justify-start"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
