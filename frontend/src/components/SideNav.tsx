import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Building2,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  roles: Array<'ADMIN' | 'OPERARIO'>;
}> = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/app', roles: ['ADMIN', 'OPERARIO'] },
  { icon: Package, label: 'Envios', href: '/app/envios', roles: ['ADMIN', 'OPERARIO'] },
  { icon: FileText, label: 'Reportes', href: '/app/reportes', roles: ['ADMIN'] },
  { icon: Users, label: 'Usuarios', href: '/app/usuarios', roles: ['ADMIN'] },
  { icon: Building2, label: 'Sucursales', href: '/app/sucursales', roles: ['ADMIN'] },
];

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes((user?.rol ?? 'OPERARIO') as 'ADMIN' | 'OPERARIO'));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-60 min-h-screen bg-white/80 backdrop-blur-sm border-r border-clay/30 px-6 py-8 flex flex-col">
      <div>
        <h1 className="font-display text-4xl text-gradient leading-none">XpressPack</h1>
        <p className="text-sm text-ink/50 mt-2">Admin Panel</p>
      </div>

      <nav className="mt-10 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/app' && location.pathname.startsWith(item.href));

          return (
            <Link key={item.href} to={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <Link to="/app/envios/nuevo" className="btn btn-primary w-full justify-center">
          <Plus className="h-4 w-4" />
          Nuevo envio
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost w-full justify-start text-error hover:bg-error/10"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
