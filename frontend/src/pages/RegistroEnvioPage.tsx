import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createShipment } from '../services/shipmentService';
import { fetchSucursales } from '../services/sucursalService';
import type { CreateEnvioRequest, Sucursal } from '../types';

export default function RegistroEnvioPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  
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
    descripcion: ''
  });

  useEffect(() => {
    // Intentar cargar las sucursales para los selectores
    fetchSucursales().then(setSucursales).catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'peso' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validación básica
    if (formData.remitenteDni.length !== 8 || formData.destinatarioDni.length !== 8) {
      setError('Los DNI deben tener 8 dígitos.');
      setLoading(false);
      return;
    }

    try {
      // Simula la llamada al backend que a su vez llama a RENIEC
      await createShipment(formData);
      navigate('/app/envios'); // Redirigir de vuelta a la lista en caso de éxito
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el envío. Verifica los datos o el DNI de destino.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl">Registrar Nuevo Envío</h1>
        <p className="text-sm text-ink/60">Ingresa los datos para generar el tracking y la guía logística.</p>
      </header>
      
      <div className="glass-card max-w-3xl p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          {/* Remitente */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-ink/50">Datos del Remitente</h3>
          </div>
          <label className="field-label">
            DNI Remitente
            <input className="input" type="text" name="remitenteDni" required maxLength={8} value={formData.remitenteDni} onChange={handleChange} />
          </label>
          <label className="field-label">
            Nombre Remitente
            <input className="input" type="text" name="remitenteNombre" required value={formData.remitenteNombre} onChange={handleChange} />
          </label>

          {/* Destinatario */}
          <div className="mt-4 md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-ink/50">Datos del Destinatario (Se Validará en RENIEC)</h3>
          </div>
          <label className="field-label">
            DNI Destinatario
            <input className="input" type="text" name="destinatarioDni" required maxLength={8} value={formData.destinatarioDni} onChange={handleChange} />
          </label>
          <label className="field-label">
            Nombre Destinatario
            <input className="input" type="text" name="destinatarioNombre" required value={formData.destinatarioNombre} onChange={handleChange} />
          </label>

          {/* Detalles de Envío */}
          <div className="mt-4 md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] text-ink/50">Detalles del Paquete</h3>
          </div>
          <label className="field-label">
            Sucursal Origen
            <select className="select" name="sucursalOrigenId" required value={formData.sucursalOrigenId} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            Sucursal Destino
            <select className="select" name="sucursalDestinoId" required value={formData.sucursalDestinoId} onChange={handleChange}>
              <option value="">Seleccionar...</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </label>
          
          <label className="field-label">
            Peso (kg)
            <input className="input" type="number" name="peso" step="0.1" required value={formData.peso} onChange={handleChange} />
          </label>
          <label className="field-label">
            Dimensiones (ej: 30x20x10)
            <input className="input" type="text" name="dimensiones" required value={formData.dimensiones} onChange={handleChange} />
          </label>

          <label className="field-label">
            Tipo de Servicio
            <select className="select" name="tipoServicio" required value={formData.tipoServicio} onChange={handleChange}>
              <option value="ESTANDAR">Estándar</option>
              <option value="EXPRESS">Express</option>
              <option value="FRAGIL">Frágil</option>
            </select>
          </label>

          <label className="field-label md:col-span-2">
            Descripción del contenido
            <textarea className="textarea" name="descripcion" required rows={3} value={formData.descripcion} onChange={handleChange}></textarea>
          </label>

          <div className="mt-4 flex gap-3 md:col-span-2">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Envío'}
            </button>
            <button type="button" className="btn-ghost" onClick={() => navigate('/app/envios')} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
