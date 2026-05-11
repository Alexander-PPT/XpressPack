import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError('Credenciales invalidas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Acceso interno</h1>
        <p className="muted">Panel de operaciones RutaSync</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="operario@rutasync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? <div className="alert">{error}</div> : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
      <div className="auth-aside">
        <h2>Control total de envios</h2>
        <p>
          Gestiona registros, estados, reportes y equipos desde un solo panel.
        </p>
        <ul>
          <li>Validacion RENIEC y tracking publico</li>
          <li>Notificaciones automaticas</li>
          <li>Reportes PDF en segundos</li>
        </ul>
      </div>
    </div>
  );
}
