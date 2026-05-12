import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Package, Mail, Lock } from 'lucide-react';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/app', { replace: true });
    } catch {
      setError('Credenciales inválidas. Verifica tu email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && !loading;

  return (
    <div className="auth-shell grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="px-6 py-10 md:px-16 md:py-16 flex flex-col justify-center">
        <div className="mx-auto w-full max-w-xl">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-8 w-8 text-pine" />
            <div>
              <h1 className="font-display text-2xl font-bold text-gradient">XpressPack</h1>
              <p className="text-xs text-ink/50">Admin Panel</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-4xl font-bold">Acceso interno</h2>
            <p className="mt-2 text-sm text-ink/60">Panel de operaciones para gestionar envíos</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && (
              <Alert type="error" message={error} onClose={() => setError(null)} dismissible />
            )}

            <div className="form-group">
              <label className="field-label required">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                <input
                  className="input pl-12"
                  type="email"
                  placeholder="operario@xpresspack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label required">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 pointer-events-none" />
                <input
                  className="input pl-12 pr-12"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/60 transition"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid}
              isLoading={loading}
              size="lg"
              className="w-full"
            >
              {loading ? 'Ingresando...' : 'Ingresar al panel'}
            </Button>

            <p className="text-xs text-center text-ink/60">
              ¿Problemas para acceder?{' '}
              <a href="mailto:soporte@xpresspack.com" className="text-pine font-semibold hover:text-pineDark">
                Contacta soporte
              </a>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden md:flex md:flex-col md:justify-center md:px-16 md:py-16">
        <div className="glass-card-lg p-12 space-y-8">
          <div>
            <h2 className="font-display text-3xl font-bold mb-3">Control total de envíos</h2>
            <p className="text-sm text-ink/70">
              Gestiona registros, estados, reportes y equipos desde un solo panel intuitivo.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '✓', label: 'Validación RENIEC', desc: 'Verificación automática de identidad' },
              { icon: '📬', label: 'Tracking público', desc: 'Rastreo en tiempo real' },
              { icon: '📧', label: 'Notificaciones', desc: 'Alertas por email automáticas' },
              { icon: '📊', label: 'Reportes PDF', desc: 'Generación en segundos' },
            ].map((feature) => (
              <div key={feature.label} className="flex gap-4">
                <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-sm">{feature.label}</h3>
                  <p className="text-xs text-ink/60 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-clay/40 pt-6">
            <p className="text-xs text-ink/50">
              <strong>Tip:</strong> Usa las credenciales de demostración para explorar todas las funcionalidades del panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
