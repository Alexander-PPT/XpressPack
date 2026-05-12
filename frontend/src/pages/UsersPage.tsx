import { useEffect, useState } from 'react';
import { createUser, fetchUsers } from '../services/userService';
import type { User } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'OPERARIO' as 'ADMIN' | 'OPERARIO'
  });

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm({ nombre: '', email: '', password: '', rol: 'OPERARIO' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Usuarios</h1>
          <p className="text-sm text-ink/60">Gestion de roles y accesos</p>
        </div>
        <button className="btn" onClick={() => document.getElementById('user-create-form')?.scrollIntoView({ behavior: 'smooth' })}>Nuevo usuario</button>
      </header>

      <form id="user-create-form" onSubmit={submit} className="glass-card mb-6 grid gap-3 p-4 md:grid-cols-4">
        <input className="input" placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" type="password" placeholder="Contrasena" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <div className="flex gap-2">
          <select className="select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as 'ADMIN' | 'OPERARIO' })}>
            <option value="OPERARIO">OPERARIO</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="btn" type="submit" disabled={creating}>{creating ? 'Guardando...' : 'Crear'}</button>
        </div>
      </form>

      <div className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg">Equipo interno</h3>
          <span className="text-sm text-ink/60">{users.length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink/50">
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-clay/60">
                  <td className="py-3">{user.nombre}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">{user.rol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
