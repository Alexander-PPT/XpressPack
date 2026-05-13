import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { Package, Mail, Lock, Eye, EyeOff, ShieldCheck, Truck, BarChart3, BellRing } from 'lucide-react';
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('USER_NOT_FOUND')) {
        setError('Usuario no existe. Verifica el email.');
      } else if (msg.includes('USER_INACTIVE')) {
        setError('Tu usuario esta inactivo. Contacta al administrador.');
      } else if (msg.includes('INVALID_PASSWORD')) {
        setError('Contrasena incorrecta. Intenta nuevamente.');
      } else {
        setError('Credenciales invalidas. Verifica tu email y contrasena.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && !loading;

  const features = [
    { icon: ShieldCheck, label: 'Validacion RENIEC', desc: 'Verificacion automatica de identidad' },
    { icon: Truck, label: 'Tracking publico', desc: 'Rastreo y estados en tiempo real' },
    { icon: BellRing, label: 'Notificaciones', desc: 'Alertas automaticas por email' },
    { icon: BarChart3, label: 'Reportes', desc: 'Metricas y PDF listos para entregar' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_25%_-5%,rgba(26,144,117,0.20),transparent_60%),radial-gradient(800px_400px_at_90%_10%,rgba(46,120,186,0.18),transparent_60%),#ebe7de]">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 gap-8 px-6 py-10 md:px-14 md:py-14">
        <section className="flex flex-col justify-center">
          <div className="mx-auto w-full max-w-xl">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/50 bg-white/60 px-4 py-3 shadow-sm backdrop-blur">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-pine/15 text-pine">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-pine">XpressPack</h1>
                <p className="text-xs text-ink/60">Admin Panel</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-5xl leading-tight font-bold text-ink">Acceso interno</h2>
              <p className="mt-2 text-base text-ink/65">Panel de operaciones para gestionar envios, equipo y reportes.</p>
            </div>

            <div className="mt-8 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <Alert type="error" message={error} onClose={() => setError(null)} dismissible />}

                <div className="form-group">
                  <label className="field-label required">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
                    <input
                      className="input rounded-xl border-2 border-clay/50 bg-white/90 pl-12 shadow-sm transition focus:border-pine"
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
                  <label className="field-label required">Contrasena</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink/40" />
                    <input
                      className="input rounded-xl border-2 border-clay/50 bg-white/90 pl-12 pr-12 shadow-sm transition focus:border-pine"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/45 transition hover:text-ink/70"
                      aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={!isFormValid} isLoading={loading} size="lg" className="w-full rounded-xl shadow-sm">
                  {loading ? 'Ingresando...' : 'Ingresar al panel'}
                </Button>

                <p className="text-center text-xs text-ink/60">
                  Problemas para acceder?{' '}
                  <a href="mailto:soporte@xpresspack.com" className="font-semibold text-pine hover:text-pineDark">
                    Contacta soporte
                  </a>
                </p>
              </form>
            </div>
          </div>
        </section>

        <aside className="hidden md:flex md:items-center md:justify-center">
          <div className="w-full max-w-xl rounded-3xl border border-white/60 bg-white/70 p-10 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pine/80">Centro logistico</p>
              <h3 className="mt-3 font-display text-4xl font-bold leading-tight text-ink">Control total de envios</h3>
              <p className="mt-3 text-sm text-ink/65">Monitorea operaciones, estados y reportes desde un solo panel con trazabilidad completa.</p>
            </div>

            <div className="mt-8 space-y-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.label} className="flex items-start gap-4 rounded-xl border border-clay/45 bg-white/70 px-4 py-3">
                    <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg bg-pine/12 text-pine">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-ink">{feature.label}</h4>
                      <p className="text-sm text-ink/60">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
