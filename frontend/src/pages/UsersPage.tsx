import { useEffect, useState } from 'react';
import { fetchUsers } from '../services/userService';
import type { User } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Usuarios</h1>
          <p className="text-sm text-ink/60">Gestion de roles y accesos</p>
        </div>
        <button className="btn">Nuevo usuario</button>
      </header>

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
