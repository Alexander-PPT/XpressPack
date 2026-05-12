import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Package, MapPin, FileText, ChevronLeft } from 'lucide-react';
import { createShipment } from '../services/shipmentService';
import { fetchSucursales } from '../services/sucursalService';
import type { CreateEnvioRequest, Sucursal } from '../types';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function RegistroEnvioPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [step, setStep] = useState(1);

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
    fetchSucursales().then(setSucursales).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['peso', 'valorDeclarado'].includes(name) ? parseFloat(value) || 0 : value
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.remitenteDni || !formData.remitenteNombre) {
        setError('Completa los datos del remitente');
        return false;
      }
      if (formData.remitenteDni.length !== 8) {
        setError('El DNI debe tener 8 dígitos');
        return false;
      }
    } else if (step === 2) {
      if (!formData.destinatarioDni || !formData.destinatarioNombre) {
        setError('Completa los datos del destinatario');
        return false;
      }
      if (formData.destinatarioDni.length !== 8) {
        setError('El DNI debe tener 8 dígitos');
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el envío. Verifica los datos o el DNI de destino.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Remitente', icon: <User className="h-5 w-5" /> },
    { number: 2, title: 'Destinatario', icon: <Package className="h-5 w-5" /> },
    { number: 3, title: 'Sucursales & Peso', icon: <MapPin className="h-5 w-5" /> },
    { number: 4, title: 'Detalles', icon: <FileText className="h-5 w-5" /> }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="mb-4">
          <ChevronLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="font-display text-4xl font-bold">Registrar nuevo envío</h1>
        <p className="text-sm text-ink/60 mt-2">Completa el formulario para generar tracking y guía logística</p>
      </div>

      {/* Progress Steps */}
      <div className="card p-6">
        <div className="flex justify-between items-center">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex-1 flex items-center">
              <button
                onClick={() => step >= s.number && setStep(s.number)}
                className={`flex items-center gap-3 transition ${
                  step >= s.number ? 'opacity-100' : 'opacity-50'
                }`}
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
                  {step > s.number ? '✓' : s.number}
                </div>
                <span className={`text-sm font-semibold hidden md:block ${step === s.number ? 'text-pine' : 'text-ink/60'}`}>
                  {s.title}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition ${
                    step > s.number ? 'bg-success' : 'bg-clay/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Step 1: Remitente */}
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
                  value={formData.remitenteDni}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="field-label required">Nombre del remitente</label>
                <input
                  className="input"
                  type="text"
                  name="remitenteNombre"
                  placeholder="Juan Pérez"
                  value={formData.remitenteNombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button onClick={() => navigate(-1)} variant="secondary">
                Cancelar
              </Button>
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Destinatario */}
        {step === 2 && (
          <div className="card p-8 space-y-6 slide-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber/10 rounded-lg">
                <Package className="h-6 w-6 text-amber" />
              </div>
              <h2 className="font-display text-2xl font-bold">Datos del destinatario</h2>
              <span className="text-xs text-ink/50 ml-auto">Se validará en RENIEC</span>
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
                  value={formData.destinatarioDni}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="field-label required">Nombre del destinatario</label>
                <input
                  className="input"
                  type="text"
                  name="destinatarioNombre"
                  placeholder="María García"
                  value={formData.destinatarioNombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(1)} variant="secondary">
                Anterior
              </Button>
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Sucursales & Peso */}
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
                  required
                >
                  <option value="">Seleccionar...</option>
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
                  required
                >
                  <option value="">Seleccionar...</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.ciudad})
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  required
                />
              </div>
            </div>

            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(2)} variant="secondary">
                Anterior
              </Button>
              <Button onClick={handleNext}>
                Siguiente
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Detalles */}
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
                  required
                >
                  <option value="ESTANDAR">Estándar</option>
                  <option value="EXPRESS">Express</option>
                  <option value="FRAGIL">Frágil</option>
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
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label required">Descripción del contenido</label>
              <textarea
                className="textarea"
                name="descripcion"
                placeholder="Describe lo que contiene el paquete..."
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="bg-sand/50 rounded-lg p-4">
              <p className="text-xs text-ink/60">
                <strong>Resumen:</strong> Envío de {formData.peso} kg desde {sucursales.find(s => s.id === formData.sucursalOrigenId)?.nombre || 'sucursal'} hacia {sucursales.find(s => s.id === formData.sucursalDestinoId)?.nombre || 'sucursal'} como {formData.tipoServicio.toLowerCase()}
              </p>
            </div>

            <div className="flex justify-between gap-3">
              <Button onClick={() => setStep(3)} variant="secondary">
                Anterior
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                disabled={loading}
              >
                Registrar envío
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
