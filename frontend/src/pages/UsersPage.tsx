import { useEffect, useState } from 'react';
import SideNav from '../components/SideNav';
import { fetchUsers } from '../services/userService';
import type { User, Role } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', rol: 'OPERARIO' as Role, sucursalId: '' });

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to create user
    alert(`Llamada simulada para crear usuario: ${formData.nombre}`);
    setShowForm(false);
  };

  return (
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Usuarios</h1>
            <p className="muted">Gestion de roles y accesos</p>
          </div>
          <button className="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Nuevo usuario'}
          </button>
        </header>

        {showForm && (
          <div className="table-card" style={{ marginBottom: '24px' }}>
            <h3>Registrar Nuevo Usuario</h3>
            <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <label>
                Nombre Completo
                <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              </label>
              <label>
                Correo Electrónico
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </label>
              <label>
                Rol
                <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value as Role})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <option value="OPERARIO">Operario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
              <button type="submit" className="primary" style={{ alignSelf: 'end' }}>Guardar Usuario</button>
            </form>
          </div>
        )}

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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td><span className="status-pill status-viaje">{user.rol}</span></td>
                    <td>
                      <button className="ghost" style={{ padding: '4px 8px', fontSize: '12px' }}>Editar</button>
                    </td>
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
