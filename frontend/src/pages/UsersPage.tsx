import { useEffect, useState } from 'react';
import { createUser, fetchUsers } from '../services/userService';
import { Users, Mail, Lock, Shield, Plus, User } from 'lucide-react';
import type { User } from '../types';
import Button from '../components/Button';
import Badge from '../components/Badge';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'OPERARIO' as 'ADMIN' | 'OPERARIO'
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({ nombre: '', email: '', password: '', rol: 'OPERARIO' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
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

          <form onSubmit={submit} className="space-y-6">
            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                  <input
                    className="input pl-12"
                    placeholder="Juan Pérez"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
                    className="input pl-12"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    disabled={creating}
                  />
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
                          <User className="h-5 w-5 text-pine" />
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
                        {new Date(user.createdAt || Date.now()).toLocaleDateString('es-PE')}
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
      </div>
    </div>
  );
}
