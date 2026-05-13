import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, FileText, ChevronLeft } from 'lucide-react';
import { createShipment } from '../services/shipmentService';
import { fetchSucursales } from '../services/sucursalService';
import type { CreateEnvioRequest, Sucursal } from '../types';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useDniLookup } from '../hooks/useDniLookup';

export default function RegistroEnvioPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [step, setStep] = useState(1);
  const { lookupDni, dniLoading, dniError, clearDniError } = useDniLookup();

  const [formData, setFormData] = useState<CreateEnvioRequest>({
    remitenteDni: '',
    remitenteNombre: '',
    destinatarioDni: '',
    destinatarioNombre: '',
    sucursalOrigenId: '',
    sucursalDestinoId: '',
    peso: 0,
    dimensiones: '',
    tipoServicio: 'ESTANDAR',
    descripcion: '',
    valorDeclarado: 0
  });

  useEffect(() => {
    let isMounted = true;
    setLoadingSucursales(true);
    fetchSucursales()
      .then((data) => {
        if (isMounted) setSucursales(data);
      })
      .catch(() => {
        if (isMounted) {
          setError('No se pudieron cargar las sucursales. Verifica que existan sucursales activas.');
        }
      })
      .finally(() => {
        if (isMounted) setLoadingSucursales(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['peso', 'valorDeclarado'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const handleRemitenteDniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    clearDniError();
    setFormData((prev) => ({ ...prev, remitenteDni: value }));

    if (value.length === 8) {
      const nombre = await lookupDni(value);
      if (nombre) {
        setFormData((prev) => ({ ...prev, remitenteNombre: nombre }));
      }
    }
  };

  const handleDestinatarioDniChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    clearDniError();
    setFormData((prev) => ({ ...prev, destinatarioDni: value }));

    if (value.length === 8) {
      const nombre = await lookupDni(value);
      if (nombre) {
        setFormData((prev) => ({ ...prev, destinatarioNombre: nombre }));
      }
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.remitenteDni || !formData.remitenteNombre) {
        setError('Completa los datos del remitente');
        return false;
      }
      if (formData.remitenteDni.length !== 8) {
        setError('El DNI debe tener 8 digitos');
        return false;
      }
    } else if (step === 2) {
      if (!formData.destinatarioDni || !formData.destinatarioNombre) {
        setError('Completa los datos del destinatario');
        return false;
      }
      if (formData.destinatarioDni.length !== 8) {
        setError('El DNI debe tener 8 digitos');
        return false;
      }
    } else if (step === 3) {
      if (!formData.sucursalOrigenId || !formData.sucursalDestinoId) {
        setError('Selecciona sucursal origen y destino');
        return false;
      }
      if (!formData.peso || !formData.dimensiones) {
        setError('Completa peso y dimensiones');
        return false;
      }
    } else if (step === 4) {
      if (!formData.descripcion) {
        setError('Describe el contenido del paquete');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      await createShipment(formData);
      navigate('/app/envios', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.toLowerCase() : '';
      if (msg.includes('foreign') || msg.includes('sucursal')) {
        setError('Verifica que las sucursales seleccionadas sean validas.');
      } else if (msg.includes('dni')) {
        setError('El DNI ingresado no es valido. Verifica los datos.');
      } else {
        setError('No se pudo registrar el envio. Verifica los datos e intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Remitente', icon: <User className="h-5 w-5" /> },
    { number: 2, title: 'Destinatario', icon: <Package className="h-5 w-5" /> },
    { number: 3, title: 'Sucursales y peso', icon: <MapPin className="h-5 w-5" /> },
    { number: 4, title: 'Detalles', icon: <FileText className="h-5 w-5" /> }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="font-display text-4xl font-bold">Registrar nuevo envio</h1>
        <p className="text-sm text-ink/60 mt-2">Completa el formulario para generar tracking y guia logistica</p>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => step >= s.number && setStep(s.number)}
                className={`flex items-center gap-3 transition ${step >= s.number ? 'opacity-100' : 'opacity-50'}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    step === s.number
                      ? 'bg-pine text-white shadow-md'
                      : step > s.number
                      ? 'bg-success text-white'
                      : 'bg-clay/20 text-ink/50'
                  }`}
                >
                  {step > s.number ? '?' : s.number}
                </div>
                <span className={`text-sm font-semibold hidden md:block ${step === s.number ? 'text-pine' : 'text-ink/60'}`}>
                  {s.title}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition ${step > s.number ? 'bg-success' : 'bg-clay/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {dniError && <Alert type="warning" message={dniError} onClose={clearDniError} />}

        {step === 1 && (
          <div className="card p-8 space-y-6 slide-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pine/10 rounded-lg">
                <User className="h-6 w-6 text-pine" />
              </div>
              <h2 className="font-display text-2xl font-bold">Datos del remitente</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">DNI del remitente</label>
                <input
                  className="input"
                  type="text"
                  name="remitenteDni"
                  placeholder="12345678"
                  maxLength={8}
                  inputMode="numeric"
                  pattern="\d{8}"
                  value={formData.remitenteDni}
                  onChange={handleRemitenteDniChange}
                  disabled={loading}
                  required
                />
                {dniLoading && <p className="text-xs text-ink/60 mt-1">Consultando RENIEC...</p>}
              </div>
              <div className="form-group">
                <label className="field-label required">Nombre del remitente</label>
                <input
                  className="input"
                  type="text"
                  name="remitenteNombre"
                  placeholder="Juan Perez"
                  value={formData.remitenteNombre}
                  onChange={handleChange}
                  disabled={loading || dniLoading}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => navigate(-1)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={handleNext}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card p-8 space-y-6 slide-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber/10 rounded-lg">
                <Package className="h-6 w-6 text-amber" />
              </div>
              <h2 className="font-display text-2xl font-bold">Datos del destinatario</h2>
              <span className="text-xs text-ink/50 ml-auto">Se validara en RENIEC</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">DNI del destinatario</label>
                <input
                  className="input"
                  type="text"
                  name="destinatarioDni"
                  placeholder="87654321"
                  maxLength={8}
                  inputMode="numeric"
                  pattern="\d{8}"
                  value={formData.destinatarioDni}
                  onChange={handleDestinatarioDniChange}
                  disabled={loading}
                  required
                />
                {dniLoading && <p className="text-xs text-ink/60 mt-1">Consultando RENIEC...</p>}
              </div>
              <div className="form-group">
                <label className="field-label required">Nombre del destinatario</label>
                <input
                  className="input"
                  type="text"
                  name="destinatarioNombre"
                  placeholder="Maria Garcia"
                  value={formData.destinatarioNombre}
                  onChange={handleChange}
                  disabled={loading || dniLoading}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(1)} variant="secondary">
                Anterior
              </Button>
              <Button onClick={handleNext}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card p-8 space-y-6 slide-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ocean/10 rounded-lg">
                <MapPin className="h-6 w-6 text-ocean" />
              </div>
              <h2 className="font-display text-2xl font-bold">Sucursales y dimensiones</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Sucursal origen</label>
                <select
                  className="select"
                  name="sucursalOrigenId"
                  value={formData.sucursalOrigenId}
                  onChange={handleChange}
                  disabled={loading || loadingSucursales || sucursales.length === 0}
                  required
                >
                  <option value="">
                    {loadingSucursales ? 'Cargando sucursales...' : 'Seleccionar...'}
                  </option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.ciudad})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="field-label required">Sucursal destino</label>
                <select
                  className="select"
                  name="sucursalDestinoId"
                  value={formData.sucursalDestinoId}
                  onChange={handleChange}
                  disabled={loading || loadingSucursales || sucursales.length === 0}
                  required
                >
                  <option value="">
                    {loadingSucursales ? 'Cargando sucursales...' : 'Seleccionar...'}
                  </option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.ciudad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!loadingSucursales && sucursales.length === 0 && (
              <Alert
                type="warning"
                message="No hay sucursales activas para seleccionar. Primero registra una sucursal desde el menu Sucursales."
                dismissible={false}
              />
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Peso (kg)</label>
                <input
                  className="input"
                  type="number"
                  name="peso"
                  step="0.1"
                  min="0"
                  value={formData.peso}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="field-label required">Dimensiones (ej: 30x20x10)</label>
                <input
                  className="input"
                  type="text"
                  name="dimensiones"
                  placeholder="30x20x10 cm"
                  value={formData.dimensiones}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(2)} variant="secondary">
                Anterior
              </Button>
              <Button onClick={handleNext}>Siguiente</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card p-8 space-y-6 slide-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <FileText className="h-6 w-6 text-success" />
              </div>
              <h2 className="font-display text-2xl font-bold">Detalles finales</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label required">Tipo de servicio</label>
                <select
                  className="select"
                  name="tipoServicio"
                  value={formData.tipoServicio}
                  onChange={handleChange}
                  disabled={loading}
                  required
                >
                  <option value="ESTANDAR">Estandar</option>
                  <option value="EXPRESS">Express</option>
                  <option value="FRAGIL">Fragil</option>
                </select>
              </div>
              <div className="form-group">
                <label className="field-label">Valor declarado (S/)</label>
                <input
                  className="input"
                  type="number"
                  name="valorDeclarado"
                  step="0.01"
                  min="0"
                  value={formData.valorDeclarado}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label required">Descripcion del contenido</label>
              <textarea
                className="textarea"
                name="descripcion"
                placeholder="Describe lo que contiene el paquete..."
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="bg-sand/50 rounded-lg p-4">
              <p className="text-xs text-ink/60">
                <strong>Resumen:</strong> Envio de {formData.peso} kg desde {sucursales.find((s) => s.id === formData.sucursalOrigenId)?.nombre || 'sucursal'} hacia {sucursales.find((s) => s.id === formData.sucursalDestinoId)?.nombre || 'sucursal'} como {formData.tipoServicio.toLowerCase()}
              </p>
            </div>

            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(3)} variant="secondary">
                Anterior
              </Button>
              <Button type="submit" isLoading={loading} disabled={loading}>
                Registrar envio
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
