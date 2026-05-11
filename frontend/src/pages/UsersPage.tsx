import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { fetchUsers } from '../services/userService';
import type { User } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Usuarios</h1>
            <p className="muted">Gestion de roles y accesos</p>
          </div>
          <button className="primary">Nuevo usuario</button>
        </header>

        <div className="table-card">
          <div className="table-header">
            <h3>Equipo interno</h3>
            <span>{users.length} usuarios</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{user.rol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
