# Diagrama de Secuencia: Registro de Envío con DNI

**Archivo de referencia:** `Diagrama_de_secuencia_para_registro_de_envío.png`

---

## 📊 Descripción General

Este diagrama muestra la **secuencia completa de registro de un nuevo envío**, incluyendo validación de DNI vía API RENIEC, creación de registro en base de datos, generación de código de tracking, publicación de eventos para procesamiento asíncrono (notificaciones), y retorno de confirmación al usuario.

---

## 🔄 Flujo General

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Empleado   │    │   Frontend   │    │ API Gateway  │    │  Shipment    │    │   User       │    │Notification │
│              │    │   (React)    │    │ (Node/Expr)  │    │   Service    │    │   Service    │    │   Service   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                  │                     │                  │                     │                     │
       └──────────────────┼─────────────────────┼──────────────────┼─────────────────────┼─────────────────────┘
                Secuencia de interacción temporal
```

---

## 📋 Pasos Detallados del Flujo

### **Paso 1: Empleado Ingresa Datos del Envío**

**Actor:** Empleado (Operario o Administrador)

```
Empleado accede a formulario "Registrar Nuevo Envío"
Completa los siguientes campos:

Datos del Remitente:
  - DNI: 12345678
  - Nombre: Juan Pérez García
  
Datos del Destinatario:
  - DNI: 87654321           ← Este será validado con API RENIEC
  - Nombre: María López Rodríguez

Datos del Envío:
  - Sucursal de origen: Arequipa (sucursal-001)
  - Sucursal de destino: Lima (sucursal-002)
  - Peso: 2.5 kg
  - Dimensiones: 30x20x10 cm
  - Tipo de servicio: Estándar
  - Descripción: Documentos importantes
```

**Validación Frontend (Inicial):**
```typescript
// RegistroEnvioPage.tsx
const validar = () => {
  const errores: ValidationError[] = [];
  
  if (!formData.remitenteDni || !isSoloDigitos(formData.remitenteDni, 8)) {
    errores.push({ field: 'remitenteDni', message: 'DNI debe tener 8 dígitos' });
  }
  
  if (!formData.destinatarioDni || !isSoloDigitos(formData.destinatarioDni, 8)) {
    errores.push({ field: 'destinatarioDni', message: 'DNI debe tener 8 dígitos' });
  }
  
  if (!formData.remitenteNombre || formData.remitenteNombre.trim().length < 3) {
    errores.push({ field: 'remitenteNombre', message: 'Nombre requerido' });
  }
  
  // ... más validaciones
  
  return errores.length === 0;
};
```

---

### **Paso 2: Frontend Envía Solicitud POST**

**Actor:** Frontend (React)

```
Solicitud HTTP:
  Método: POST
  URL: /api/shipments
  Headers:
    Authorization: Bearer eyJhbGc...
    Content-Type: application/json
  
  Body (JSON):
  {
    "remitenteDni": "12345678",
    "remitenteNombre": "Juan Pérez García",
    "destinatarioDni": "87654321",
    "destinatarioNombre": "María López Rodríguez",
    "sucursalOrigenId": "sucursal-001",
    "sucursalDestinoId": "sucursal-002",
    "peso": 2.5,
    "dimensiones": "30x20x10 cm",
    "tipoServicio": "Estándar",
    "descripcion": "Documentos importantes"
  }
```

**Código Frontend:**
```typescript
// EnvioService.ts
async createEnvio(data: CreateEnvioRequest): Promise<Envio> {
  const response = await apiService.post<Envio>(
    '/api/shipments',
    data
  );
  
  return response.data;
}

// RegistroEnvioPage.tsx
async handleSubmit() {
  if (!validar()) {
    setValidationErrors(errores);
    return;
  }
  
  setLoading(true);
  
  try {
    const envio = await envioService.createEnvio(formData);
    
    // Muestra confirmación
    showNotification({
      type: 'success',
      title: 'Envío Registrado',
      message: `Código de tracking: ${envio.codigoTracking}`
    });
    
    // Navega a detalle
    navigate(`/envios/${envio.id}`);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
```

---

### **Paso 3: API Gateway Reenvía Solicitud**

**Actor:** Nginx + Backend (Express)

```
Nginx recibe POST /api/shipments
Valida que el usuario tenga JWT válido
Reenvía a Express en localhost:3001
Express Router mapea a controlador correcto:
  POST /api/shipments → shipmentController.createShipment()
```

---

### **Paso 4: Shipment Service Recibe y Valida Solicitud**

**Actor:** Backend (Shipment Service)

```
El controlador recibe la solicitud:
  1. Valida presencia de JWT en headers
  2. Extrae usuario autenticado del token
  3. Valida que usuario tenga rol OPERARIO o ADMIN
  4. Extrae datos del request body
  5. Delega a ShipmentService para crear envío
```

**Código Backend:**
```javascript
// presentation/controllers/shipment.controller.js
async function createShipment(req, res, next) {
  try {
    const usuarioId = req.usuario.id; // Obtenido del JWT
    const shipmentData = req.body;
    
    // Valida entrada
    if (!shipmentData.destinatarioDni || !shipmentData.remitenteNombre) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos faltantes'
      });
    }
    
    // Crea envío
    const envio = await shipmentService.createShipment(
      shipmentData,
      usuarioId
    );
    
    res.status(201).json({
      success: true,
      data: envio
    });
  } catch (error) {
    next(error);
  }
}
```

---

### **Paso 5: Shipment Service Solicita Validación de DNI**

**Actor:** Backend (Shipment Service → User Service)

```
Shipment Service necesita validar que el DNI del destinatario
sea válido antes de crear el envío.

Solicita validación a User Service:
  userService.validateDNI('87654321')
  
Propósito:
  - Verificar que el DNI existe en el registro nacional
  - Obtener información del nombre oficial
  - Prevenir fraudes con DNI inválidos
```

**Código Backend:**
```javascript
// application/services/shipment.service.js
async function createShipment(shipmentData, usuarioId) {
  // Validar DNI del destinatario
  const dniValidationResult = await userService.validateDNI(
    shipmentData.destinatarioDni
  );
  
  if (!dniValidationResult.esValido) {
    throw new ValidationError(
      `DNI inválido: ${dniValidationResult.mensaje}`
    );
  }
  
  // DNI es válido, continúa con creación de envío
  return await createEnvioRecord(shipmentData, usuarioId);
}
```

---

### **Paso 6: User Service Valida DNI contra API RENIEC**

**Actor:** Backend (User Service → API RENIEC)

```
User Service realiza llamada a API RENIEC (servicio externo):

Solicitud HTTP:
  Método: GET o POST (según RENIEC)
  URL: https://api.reniec.gob.pe/validate-dni
  Headers:
    Authorization: Bearer <token_reniec>
    Content-Type: application/json
  
  Body:
  {
    "dni": "87654321"
  }
  
Timeout: 5 segundos máximo
Reintentos: Hasta 2 veces si falla
```

**Código Backend:**
```javascript
// domain/services/dniLookupService.js
async function validateDNI(dni) {
  try {
    const response = await axios.get(
      'https://api.reniec.gob.pe/validate-dni',
      {
        params: { dni },
        headers: {
          'Authorization': `Bearer ${process.env.RENIEC_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000  // 5 segundos máximo
      }
    );
    
    return {
      esValido: response.data.valido,
      nombre: response.data.nombre,
      mensaje: response.data.mensaje
    };
  } catch (error) {
    // Si API RENIEC falla, permitir registro manual (fallback)
    console.error('RENIEC API error:', error.message);
    
    return {
      esValido: null,  // Desconocido
      mensaje: 'No se pudo validar DNI. Permitir registro manual.',
      puedeOmitirse: true  // Fallback: permitir registro sin validación
    };
  }
}
```

---

### **Paso 6a: Validación Exitosa (DNI Válido)**

**Flujo Exitoso:**

```
API RENIEC retorna:
  Status: 200 OK
  Body:
  {
    "valido": true,
    "nombre": "MARIA LOPEZ RODRIGUEZ",
    "mensaje": "DNI válido"
  }

User Service retorna resultado exitoso a Shipment Service
Shipment Service procede a crear registro
```

---

### **Paso 6b: Validación Fallida (DNI Inválido)**

**Flujo de Error:**

```
API RENIEC retorna:
  Status: 200 OK
  Body:
  {
    "valido": false,
    "mensaje": "DNI no encontrado en el registro"
  }

User Service lanza ValidationError
Shipment Service captura error
Backend retorna respuesta de error al frontend:
  Status: 400 Bad Request
  Body:
  {
    "success": false,
    "message": "DNI inválido",
    "errors": [
      {
        "field": "destinatarioDni",
        "message": "DNI no encontrado en el registro"
      }
    ]
  }

Frontend muestra error al empleado
Empleado puede corregir DNI e intentar nuevamente
```

---

### **Paso 7: Crea Registro de Envío en Base de Datos**

**Actor:** Backend (Shipment Service + Repository)

```
Shipment Service procede a crear registro en BD:

Datos a insertar en tabla envios:
  - id: Genera UUID único
  - guia: Genera número de guía (ej: "GUA-2026-001234")
  - codigoTracking: Genera código alfanumérico (ej: "RUT7X4K9M2P")
  - origen: "Arequipa"
  - destino: "Lima"
  - remitenteNombre: "Juan Pérez García"
  - remitenteDni: "12345678"
  - remitenteTelefono: "987654321"
  - destinatarioNombre: "María López Rodríguez"
  - destinatarioDni: "87654321"
  - destinatarioTelefono: "987654322"
  - peso: 2.5
  - dimensiones: "30x20x10 cm"
  - tipoServicio: "Estándar"
  - descripcion: "Documentos importantes"
  - estadoActualId: "estado-1"  (Recibido)
  - sucursalOrigenId: "sucursal-001"
  - sucursalDestinoId: "sucursal-002"
  - creadoPor: "usuario-uuid"  (Operario autenticado)
  - creadoEn: NOW()
  - actualizadoEn: NOW()
```

**Código Backend:**
```javascript
// application/services/shipment.service.js
async function createEnvioRecord(shipmentData, usuarioId) {
  // Genera guía y código de tracking
  const guia = generarGuia();
  const codigoTracking = generarCodigoTracking();
  
  // Obtiene estado inicial "Recibido"
  const estadoRecibido = await estadoEnvioRepository.findByNombre('Recibido');
  
  // Crea registro en BD
  const envio = await envioRepository.create({
    guia,
    codigoTracking,
    ...shipmentData,
    estadoActualId: estadoRecibido.id,
    creadoPor: usuarioId,
    creadoEn: new Date(),
    actualizadoEn: new Date()
  });
  
  return envio;
}

// data/repositories/envio.repository.js
async function create(data) {
  return await Envio.create(data);
}
```

---

### **Paso 8: Confirmación de Creación (ID de Envío)**

**Actor:** Backend (Database)

```
MySQL confirma creación y retorna registro insertado:
  {
    "id": "envio-uuid-xyz123",
    "guia": "GUA-2026-001234",
    "codigoTracking": "RUT7X4K9M2P",
    "estado": "Recibido",
    ... más campos
  }

Shipment Service recibe confirmación
Procede a publicar evento de nuevo envío
```

---

### **Paso 9: Publica Evento de Nuevo Envío**

**Actor:** Backend (Event Emitter / Message Queue)

```
Shipment Service publica evento asíncrono:
  
  EventEmitter.emit('shipment.created', {
    envioId: 'envio-uuid-xyz123',
    codigoTracking: 'RUT7X4K9M2P',
    destinatario: {
      nombre: 'María López Rodríguez',
      email: 'maria@example.com'  // Obtenido del formulario o BD
    },
    timestamp: new Date()
  });

Propósito:
  - Desacoplar creación de envío de envío de notificaciones
  - Permitir procesamiento asíncrono
  - Permitir que múltiples servicios reaccionen al evento
  - Mejorar velocidad de respuesta al cliente
```

**Código Backend:**
```javascript
// shared/events/eventEmitter.js
const EventEmitter = require('events');

class ShipmentEventEmitter extends EventEmitter {}

module.exports = new ShipmentEventEmitter();

// application/services/shipment.service.js
const eventEmitter = require('../../shared/events/eventEmitter');

async function createEnvioRecord(shipmentData, usuarioId) {
  const envio = await envioRepository.create({...});
  
  // Publica evento de manera asíncrona
  setImmediate(() => {
    eventEmitter.emit('shipment.created', {
      envioId: envio.id,
      codigoTracking: envio.codigoTracking,
      destinatario: {
        nombre: envio.destinatarioNombre,
        email: shipmentData.destinatarioEmail // Enviar correo
      }
    });
  });
  
  return envio;
}
```

---

### **Paso 10: Notification Service Procesa Evento**

**Actor:** Backend (Notification Service)

```
Notification Service escucha evento 'shipment.created'
Realiza acciones asíncrona:
  1. Crea registro en tabla notificaciones
  2. Genera cuerpo de correo HTML
  3. Envía correo al destinatario vía Nodemailer
  4. Registra resultado en BD

NO bloquea respuesta al cliente
```

**Código Backend:**
```javascript
// data/services/notification.service.js
const eventEmitter = require('../../shared/events/eventEmitter');
const nodemailer = require('nodemailer');

// Configura transporte SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Escucha evento
eventEmitter.on('shipment.created', async (event) => {
  try {
    // Crea registro en tabla notificaciones
    const notificacion = await notificacionRepository.create({
      envioId: event.envioId,
      tipo: 'CREACION_ENVIO',
      destinatario: event.destinatario.email,
      asunto: `Envío registrado - ${event.codigoTracking}`,
      estado: 'PENDIENTE'
    });
    
    // Genera contenido HTML
    const htmlContent = `
      <h2>¡Tu envío ha sido registrado!</h2>
      <p>Hola ${event.destinatario.nombre},</p>
      <p>Tu paquete ha sido registrado en RutaSync.</p>
      <p><strong>Código de Tracking: ${event.codigoTracking}</strong></p>
      <p>Puedes consultar el estado en: https://rutasync.com/tracking</p>
    `;
    
    // Envía correo
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: event.destinatario.email,
      subject: 'Envío registrado en RutaSync',
      html: htmlContent
    });
    
    // Actualiza estado de notificación
    await notificacionRepository.update(notificacion.id, {
      estado: 'ENVIADO',
      enviadoEn: new Date()
    });
    
  } catch (error) {
    console.error('Error enviando notificación:', error);
    // Registra fallo, podría implementar retry logic
  }
});
```

---

### **Paso 11: Respuesta Exitosa al Backend**

**Actor:** Backend (Shipment Service)

```
Shipment Service responde inmediatamente con:
  Status: 201 Created
  Headers:
    Content-Type: application/json
  
  Body:
  {
    "success": true,
    "data": {
      "id": "envio-uuid-xyz123",
      "guia": "GUA-2026-001234",
      "codigoTracking": "RUT7X4K9M2P",
      "origen": "Arequipa",
      "destino": "Lima",
      "remitenteNombre": "Juan Pérez García",
      "destinatarioNombre": "María López Rodríguez",
      "peso": 2.5,
      "tipoServicio": "Estándar",
      "estadoActual": {
        "nombre": "Recibido",
        "progreso": 33,
        "color": "#2E75B6"
      },
      "creadoEn": "2026-05-10T14:30:00Z"
    }
  }

Nota: La respuesta NO espera confirmación de envío de correo
      (Procesamiento asíncrono con Event Emitter)
```

---

### **Paso 12: Respuesta Retorna al Frontend**

**Actor:** Nginx + Frontend (React)

```
Nginx recibe respuesta 201 Created de backend
La reenvía al Frontend sin modificaciones
Frontend recibe datos completos del envío creado
```

---

### **Paso 13: Muestra Confirmación al Empleado**

**Actor:** Frontend (React)

```
Frontend recibe respuesta exitosa:
  1. Extrae código de tracking: "RUT7X4K9M2P"
  2. Muestra notificación flotante o modal de confirmación
  3. Muestra mensaje: "¡Envío registrado exitosamente!"
  4. Muestra código de tracking en grande
  5. Ofrece opciones:
     - Ver detalle del envío
     - Registrar otro envío
     - Volver a panel

El empleado ve confirmación y detalle del envío registrado
```

**Código Frontend:**
```typescript
// RegistroEnvioPage.tsx
async handleSubmit() {
  setLoading(true);
  
  try {
    const envio = await envioService.createEnvio(formData);
    
    // Muestra confirmación
    setConfirmacion({
      visible: true,
      envio: envio,
      codigoTracking: envio.codigoTracking
    });
    
    // Opcionalmente, navega automáticamente
    setTimeout(() => {
      navigate(`/envios/${envio.id}`);
    }, 3000);
    
  } catch (error) {
    setError({
      visible: true,
      mensaje: error.message,
      detalles: error.errors
    });
  } finally {
    setLoading(false);
  }
}

// Renderiza confirmación
return (
  {confirmacion.visible && (
    <div className="modal-confirmacion">
      <h2>✓ Envío Registrado Exitosamente</h2>
      <div className="codigo-tracking-grande">
        {confirmacion.codigoTracking}
      </div>
      <p>El destinatario recibirá notificación por correo</p>
      <button onClick={() => navigate(`/envios/${confirmacion.envio.id}`)}>
        Ver Detalle
      </button>
    </div>
  )}
);
```

---

## ⚡ Cronograma Temporal

```
Tiempo (ms)
0     ├─ Empleado completa formulario
100   ├─ Frontend valida datos locales
150   ├─ Frontend POST /api/shipments
170   ├─ Nginx recibe y reenvía
200   ├─ Backend recibe solicitud
210   ├─ Backend valida JWT
220   ├─ Backend solicita validación DNI
250   ├─ User Service → API RENIEC
300   ├─ API RENIEC responde (DNI válido)
320   ├─ User Service retorna validación
330   ├─ Shipment Service crea registro en BD
350   ├─ MySQL confirma creación
360   ├─ Shipment Service publica evento
370   ├─ Backend retorna 201 Created
390   ├─ Nginx reenvía respuesta
420   ├─ Frontend recibe y almacena datos
450   ├─ Frontend muestra confirmación
500   ├─ (Asíncrono) Notification Service envía correo
600   └─ ✅ Proceso completado

Total: ~450ms (sin esperar confirmación de correo)
```

---

## 🚨 Escenarios de Error

### **Error 1: DNI Inválido**

```
Flujo:
1. User Service consulta API RENIEC
2. API RENIEC retorna: "valido": false
3. User Service lanza ValidationError
4. Shipment Service captura excepción
5. Backend retorna 400 Bad Request
6. Frontend muestra error específico:
   "El DNI del destinatario no es válido. Verifique e intente nuevamente."
7. Empleado corrige DNI e reintenta
```

### **Error 2: API RENIEC No Disponible**

```
Flujo:
1. User Service intenta conectar a RENIEC
2. Timeout o error de conexión
3. User Service retorna fallback: "puedeOmitirse": true
4. Shipment Service permite crear envío igualmente
5. Backend retorna envío creado (con nota de validación pendiente)
6. Frontend muestra advertencia:
   "No se pudo validar DNI en línea. Se permitió registro manual."
```

### **Error 3: Base de Datos Indisponible**

```
Flujo:
1. Shipment Service intenta crear registro en BD
2. MySQL error (conexión perdida, etc.)
3. Excepción DatabaseError
4. Backend retorna 500 Internal Server Error
5. Frontend muestra error genérico:
   "Error al crear envío. Intente más tarde."
6. Administrador revisa logs
```

---

## 🔒 Consideraciones de Seguridad

1. **DNI validado:** Se evita registro de envíos con DNI falsificados
2. **JWT requerido:** Solo usuarios autenticados pueden registrar
3. **API RENIEC vía HTTPS:** Comunicación segura con tercero
4. **Rate limiting (opcional):** Limitar intentos de creación por usuario/IP
5. **Sanitización de entrada:** Escapar caracteres especiales
6. **Encriptación de datos sensibles:** DNI en BD (opcional con algoritmo simétrico)
7. **Logs de auditoría:** Registrar quién creó qué envío y cuándo

---

## 📝 Conclusión

El diagrama de secuencia de registro de envío muestra:
- **Validación robusta:** DNI verificado con API RENIEC
- **Generación automática:** Guía y código de tracking únicos
- **Procesamiento asíncrono:** Notificaciones sin bloquear respuesta
- **Trazabilidad:** Registro de quién creó cada envío y cuándo
- **Resiliencia:** Fallback si API RENIEC no está disponible

Este flujo es crítico para la calidad de datos del sistema.
