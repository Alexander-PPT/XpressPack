import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from '../components/SideNav';
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
    <div className="app-shell">
      <SideNav />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>Registrar Nuevo Envío</h1>
            <p className="muted">Ingresa los datos para generar el tracking y la guía logística.</p>
          </div>
        </header>
        
        <div className="table-card" style={{ maxWidth: '800px' }}>
          {error && <div className="alert" style={{ marginBottom: '16px' }}>{error}</div>}
          
          <form onSubmit={handleSubmit} className="auth-form" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {/* Remitente */}
            <div style={{ gridColumn: 'span 2' }}><h3 className="eyebrow">Datos del Remitente</h3></div>
            <label>
              DNI Remitente
              <input type="text" name="remitenteDni" required maxLength={8} value={formData.remitenteDni} onChange={handleChange} />
            </label>
            <label>
              Nombre Remitente
              <input type="text" name="remitenteNombre" required value={formData.remitenteNombre} onChange={handleChange} />
            </label>

            {/* Destinatario */}
            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}><h3 className="eyebrow">Datos del Destinatario (Se Validará en RENIEC)</h3></div>
            <label>
              DNI Destinatario
              <input type="text" name="destinatarioDni" required maxLength={8} value={formData.destinatarioDni} onChange={handleChange} />
            </label>
            <label>
              Nombre Destinatario
              <input type="text" name="destinatarioNombre" required value={formData.destinatarioNombre} onChange={handleChange} />
            </label>

            {/* Detalles de Envío */}
            <div style={{ gridColumn: 'span 2', marginTop: '16px' }}><h3 className="eyebrow">Detalles del Paquete</h3></div>
            <label>
              Sucursal Origen
              <select name="sucursalOrigenId" required value={formData.sucursalOrigenId} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e4ded5' }}>
                <option value="">Seleccionar...</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </label>
            <label>
              Sucursal Destino
              <select name="sucursalDestinoId" required value={formData.sucursalDestinoId} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e4ded5' }}>
                <option value="">Seleccionar...</option>
                {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </label>
            
            <label>
              Peso (kg)
              <input type="number" name="peso" step="0.1" required value={formData.peso} onChange={handleChange} />
            </label>
            <label>
              Dimensiones (ej: 30x20x10)
              <input type="text" name="dimensiones" required value={formData.dimensiones} onChange={handleChange} />
            </label>

            <label>
              Tipo de Servicio
              <select name="tipoServicio" required value={formData.tipoServicio} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e4ded5' }}>
                <option value="ESTANDAR">Estándar</option>
                <option value="EXPRESS">Express</option>
                <option value="FRAGIL">Frágil</option>
              </select>
            </label>

            <label style={{ gridColumn: 'span 2' }}>
              Descripción del contenido
              <textarea name="descripcion" required rows={3} value={formData.descripcion} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e4ded5' }}></textarea>
            </label>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button type="submit" className="primary" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Envío'}
              </button>
              <button type="button" className="ghost" onClick={() => navigate('/app/envios')} disabled={loading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
