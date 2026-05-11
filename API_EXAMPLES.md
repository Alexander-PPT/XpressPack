# Ejemplos de Uso - RutaSync Backend API
# Ejecutar estos commands en Terminal para probar los endpoints

# ============================================
# 1. HEALTH CHECK
# ============================================

# Verificar que el servidor está activo
curl -X GET http://localhost:3001/health

# Response esperado:
# {
#   "success": true,
#   "message": "API RutaSync operativa",
#   "timestamp": "2025-01-16T10:00:00.000Z"
# }

echo -e "\n--- Health Check OK ---\n"


# ============================================
# 2. AUTENTICACIÓN
# ============================================

# Login como Admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rutasync.com",
    "password": "Admin123!"
  }'

# Response esperado:
# {
#   "success": true,
#   "message": "Usuario autenticado exitosamente",
#   "data": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#     "usuario": {
#       "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
#       "nombre": "Administrador RutaSync",
#       "email": "admin@rutasync.com",
#       "rol": "ADMIN"
#     }
#   }
# }

# ⚠️ GUARDA EL TOKEN PARA USAR EN LAS SIGUIENTES PETICIONES

export TOKEN="PEGA_AQUI_EL_TOKEN_DE_LA_RESPUESTA_ANTERIOR"

echo -e "\n--- Login OK ---\n"


# ============================================
# 3. CREAR ENVÍO
# ============================================

curl -X POST http://localhost:3001/api/shipments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "remitenteDni": "12345678",
    "remitenteNombre": "Juan Pérez García",
    "remitenteEmail": "juan.perez@example.com",
    "remitentePhone": "+51999999999",
    "destinatarioDni": "87654321",
    "destinatarioNombre": "María García López",
    "destinatarioEmail": "maria.garcia@example.com",
    "destinatarioPhone": "+51988888888",
    "peso": 5.5,
    "volumen": 0.025,
    "tipoServicio": "EXPRESS",
    "descripcion": "Documento importante y confidencial",
    "sucursalOrigenId": "cccccccc-cccc-cccc-cccc-cccccccccccc",
    "sucursalDestinoId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
    "monto": 150.00
  }'

# Response esperado:
# {
#   "success": true,
#   "message": "Envío registrado exitosamente",
#   "data": {
#     "id": "uuid-del-envio",
#     "guia": "RUT-1704067200000-ABC123",
#     "codigoTracking": "1702400ABC",
#     "estado": "Recibido",
#     "createdAt": "2025-01-16T10:00:00.000Z"
#   }
# }

# ⚠️ GUARDA EL ID Y CÓDIGO DE TRACKING PARA USAR DESPUÉS

export SHIPMENT_ID="PEGA_AQUI_EL_ID_DEL_ENVIO"
export TRACKING_CODE="PEGA_AQUI_EL_CODIGO_TRACKING"

echo -e "\n--- Shipment Created OK ---\n"


# ============================================
# 4. LISTAR ENVÍOS
# ============================================

# Sin filtros
curl -X GET "http://localhost:3001/api/shipments" \
  -H "Authorization: Bearer $TOKEN"

# Con filtros y paginación
curl -X GET "http://localhost:3001/api/shipments?estado=Recibido&page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# {
#   "success": true,
#   "data": [ { shipment objects } ],
#   "pagination": {
#     "page": 1,
#     "pageSize": 10,
#     "totalItems": 5,
#     "totalPages": 1
#   }
# }

echo -e "\n--- Shipments Listed OK ---\n"


# ============================================
# 5. OBTENER DETALLES DE ENVÍO
# ============================================

curl -X GET "http://localhost:3001/api/shipments/$SHIPMENT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# {
#   "success": true,
#   "data": {
#     "shipment": { ...datos del envío },
#     "historial": [
#       {
#         "id": "uuid",
#         "estadoAnterior": null,
#         "estadoNuevo": "Recibido",
#         "razon": "Envío creado en el sistema",
#         "createdAt": "2025-01-16T10:00:00.000Z"
#       }
#     ]
#   }
# }

echo -e "\n--- Shipment Details Retrieved OK ---\n"


# ============================================
# 6. CAMBIAR ESTADO DE ENVÍO
# ============================================

# Cambiar a "En Viaje"
curl -X PATCH "http://localhost:3001/api/shipments/$SHIPMENT_ID/estado" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nuevoEstado": "En Viaje",
    "razon": "Envío despachado desde sucursal Lima Centro"
  }'

# Response esperado:
# {
#   "success": true,
#   "message": "Estado actualizado a En Viaje",
#   "data": { ...envío actualizado }
# }

echo -e "\n--- Status Updated to 'En Viaje' OK ---\n"


# ============================================
# 7. OBTENER ESTADÍSTICAS
# ============================================

curl -X GET http://localhost:3001/api/shipments/stats/by-status \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# {
#   "success": true,
#   "data": {
#     "Recibido": 2,
#     "En Viaje": 1,
#     "Entregado": 0
#   }
# }

echo -e "\n--- Stats Retrieved OK ---\n"


# ============================================
# 8. TRACKING PÚBLICO (Sin Autenticación)
# ============================================

# ⚠️ IMPORTANTE: Este endpoint NO requiere token

# Consultar por código de tracking
curl -X GET "http://localhost:3001/api/tracking/$TRACKING_CODE"

# Response esperado (datos públicos solamente):
# {
#   "success": true,
#   "data": {
#     "codigoTracking": "1702400ABC",
#     "estado": "En Viaje",
#     "remitenteNombre": "Juan Pérez García",
#     "destinatarioNombre": "María García López",
#     "tipoServicio": "EXPRESS",
#     "fechaCreacion": "2025-01-16T10:00:00.000Z",
#     "fechaEntrega": null
#   }
# }

echo -e "\n--- Public Tracking Retrieved OK ---\n"


# ============================================
# 9. LOGOUT
# ============================================

curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"

# Response esperado:
# {
#   "success": true,
#   "message": "Sesión cerrada correctamente"
# }

echo -e "\n--- Logout OK ---\n"


# ============================================
# ERRORES COMUNES Y SOLUCIONES
# ============================================

# Error: "connect ECONNREFUSED"
# → El servidor no está corriendo: npm run dev

# Error: 401 "Token no proporcionado"
# → Falta Authorization header, verifica que TOKEN esté configurado

# Error: 403 "No tiene permisos"
# → Tu usuario no tiene el rol necesario (revisa loginRules en validation-rules.js)

# Error: 404 "Envío no encontrado"
# → El ID del envío no existe, verifica que SHIPMENT_ID sea correcto

# Error: 400 "DNI inválido"
# → El DNI debe tener exactamente 8 dígitos numéricos


# ============================================
# TIPS PARA TESTING
# ============================================

# Instalar jq para prettier output:
# sudo apt-get install jq  # Linux
# brew install jq          # macOS

# Usar jq con curl:
# curl ... | jq

# Guardar respuesta en archivo:
# curl ... > response.json

# Ver solo headers:
# curl -i http://localhost:3001/health

# Ver respuesta con timing:
# curl -w "\n%{http_code}\n" ...

# Repetir request múltiples veces:
# for i in {1..5}; do curl ...; done
