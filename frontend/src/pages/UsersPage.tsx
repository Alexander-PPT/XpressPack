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

      <form id="user-create-form" onSubmit={submit} className="glass-card mb-6 p-6">
        <div className="mb-4">
          <h3 className="font-display text-lg">Crear nuevo usuario</h3>
          <p className="text-sm text-ink/60">Registra miembros internos y define su rol de acceso.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-12">
          <label className="field-label md:col-span-3">
            Nombre
            <input className="input" placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </label>
          <label className="field-label md:col-span-4">
            Email
            <input className="input" type="email" placeholder="correo@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label className="field-label md:col-span-3">
            Contrasena
            <input className="input" type="password" placeholder="********" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label className="field-label md:col-span-2">
            Rol
            <select className="select" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value as 'ADMIN' | 'OPERARIO' })}>
              <option value="OPERARIO">OPERARIO</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn min-w-[130px]" type="submit" disabled={creating}>{creating ? 'Guardando...' : 'Crear usuario'}</button>
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
                  <td className="py-3">
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink/80">
                      {user.rol}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
