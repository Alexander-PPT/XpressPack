import { useEffect, useState } from 'react';
import { createUser, fetchUsers } from '../services/userService';
import { Users, Mail, Lock, Shield, Plus, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import type { User } from '../types';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Toast from '../components/Toast';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'OPERARIO' as 'ADMIN' | 'OPERARIO'
  });

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        if (isMounted) setLoading(true);
        const data = await fetchUsers();
        if (isMounted) setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const formatDate = (value?: string) => {
    if (!value) return 'Sin fecha';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? 'Sin fecha' : parsed.toLocaleDateString('es-PE');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({ nombre: '', email: '', password: '', rol: 'OPERARIO' });
      setShowPassword(false);
      setShowForm(false);
      setToast({ type: 'success', message: `Usuario ${created.nombre} creado correctamente.` });
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const msg = error instanceof Error ? error.message.toLowerCase() : '';
      if (msg.includes('no_session')) {
        setToast({ type: 'error', message: 'Sesion expirada. Vuelve a iniciar sesion.' });
      } else if (msg.includes('forbidden') || msg.includes('401') || msg.includes('permission') || msg.includes('unauthorized') || msg.includes('42501')) {
        setToast({ type: 'error', message: 'No tienes permisos para crear usuarios. Inicia sesion con un admin valido.' });
      } else if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already')) {
        setToast({ type: 'error', message: 'Ese email ya esta registrado.' });
      } else {
        setToast({ type: 'error', message: 'No se pudo crear el usuario. Intenta nuevamente.' });
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="fixed top-5 right-5 z-50 w-[min(92vw,420px)] pointer-events-none">
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl font-bold">Usuarios</h1>
          <p className="text-sm text-ink/60 mt-2">Gestión de roles, accesos y miembros del equipo</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg">
          <Plus className="h-5 w-5" />
          Nuevo usuario
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card p-8 space-y-6 slide-in">
          <div>
            <h2 className="font-display text-2xl font-bold">Crear nuevo usuario</h2>
            <p className="text-sm text-ink/60 mt-1">Registra miembros internos y define su rol de acceso.</p>
          </div>

          <form onSubmit={submit} className="space-y-6" autoComplete="off">
            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Nombre completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    placeholder="Juan Pérez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    autoComplete="off"
                    required
                    disabled={creating}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="field-label required">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    type="email"
                    placeholder="juan@empresa.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="off"
                    required
                    disabled={creating}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12 pr-12"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                    required
                    disabled={creating}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink/50 hover:text-ink transition"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    disabled={creating}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="field-label required">Rol</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <select
                    className="select pl-12"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value as 'ADMIN' | 'OPERARIO' })}
                    disabled={creating}
                  >
                    <option value="OPERARIO">Operario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowForm(false)} disabled={creating}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating} isLoading={creating}>
                Crear usuario
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="card p-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pine/10 rounded-lg">
              <Users className="h-6 w-6 text-pine" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">Equipo interno</h2>
              <p className="text-sm text-ink/60">{users.length} miembro{users.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-sm text-ink/60">Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 text-ink/20 mx-auto mb-4" />
            <h3 className="font-display text-lg mb-2">Sin usuarios</h3>
            <p className="text-ink/60 text-sm mb-6">No hay usuarios registrados todavía</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              Crear primer usuario
            </Button>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Unido</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pine/10 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-pine" />
                        </div>
                        <span className="font-semibold">{user.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-xs font-mono text-ink/60">{user.email}</code>
                    </td>
                    <td>
                      <Badge variant={user.rol === 'ADMIN' ? 'primary' : 'default'}>
                        {user.rol === 'ADMIN' ? '👑 Administrador' : '👤 Operario'}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-sm text-ink/60">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


