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
    } catch {
      setError('Credenciales invalidas. Verifica tu email y contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="px-6 py-10 md:px-16 md:py-16">
        <div className="auth-card mx-auto w-full max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">RutaSync</p>
          <h1 className="mt-2 font-display text-3xl">Acceso interno</h1>
          <p className="mt-2 text-sm text-ink/60">Panel de operaciones RutaSync</p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <label className="field-label">
              Email
              <input
                className="input"
                type="email"
                placeholder="operario@rutasync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="field-label">
              Contrasena
              <input
                className="input"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>

      <div className="px-8 py-10 md:px-16 md:py-16">
        <div className="glass-card h-full rounded-2xl border border-clay/60 p-8 md:p-10">
          <h2 className="font-display text-3xl">Control total de envios</h2>
          <p className="mt-3 text-sm text-ink/70">
            Gestiona registros, estados, reportes y equipos desde un solo panel.
          </p>
          <ul className="mt-8 grid gap-4 text-sm text-ink/70">
            <li className="rounded-lg bg-white/70 px-4 py-3">Validacion RENIEC y tracking publico</li>
            <li className="rounded-lg bg-white/70 px-4 py-3">Notificaciones automaticas</li>
            <li className="rounded-lg bg-white/70 px-4 py-3">Reportes PDF en segundos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
