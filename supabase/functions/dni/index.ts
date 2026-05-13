import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RENIEC_API_URL = Deno.env.get("RENIEC_API_URL") || "https://api.decolecta.com";
const RENIEC_API_KEY = Deno.env.get("RENIEC_API_KEY");

interface DniResponse {
  success: boolean;
  data?: {
    nombreCompleto?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
  };
  error?: string;
}

// Validar JWT
async function validateJWT(authHeader?: string): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  // En producción, validar JWT correctamente
  // Por ahora, simplemente verificar que exista el token
  return true;
}

// Normalizar respuesta de RENIEC
function normalizeDniResponse(payload: any): any {
  const data = payload?.data || payload?.persona || payload || {};
  const apellidoPaterno =
    data.first_last_name ||
    data.apellido_paterno ||
    data.apellidoPaterno ||
    "";
  const apellidoMaterno =
    data.second_last_name ||
    data.apellido_materno ||
    data.apellidoMaterno ||
    "";
  const nombres = data.first_name || data.nombres || "";
  const nombreCompleto =
    data.full_name ||
    data.nombre_completo ||
    data.nombreCompleto ||
    data.nombre ||
    [nombres, apellidoPaterno, apellidoMaterno]
      .filter(Boolean)
      .join(" ")
      .trim();

  return {
    valido: Boolean(payload?.success ?? payload?.valido ?? nombreCompleto),
    dni: data.document_number || data.numero || data.dni || data.documento || "",
    nombreCompleto,
    nombres,
    apellidoPaterno,
    apellidoMaterno,
    mensaje: payload?.message || payload?.mensaje || "DNI encontrado",
  };
}

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validar autenticación
    const authHeader = req.headers.get("Authorization");
    if (!(await validateJWT(authHeader))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Token no proporcionado o formato inválido",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extraer DNI de la URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const dni = pathParts[pathParts.length - 1];

    // Validar DNI
    if (!dni || !/^\d{8}$/.test(dni)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "DNI inválido. Debe tener 8 dígitos.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar que API key esté configurada
    if (!RENIEC_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API de DNI no configurada en el servidor",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Llamar a API de RENIEC
    const response = await fetch(`${RENIEC_API_URL}/v1/reniec/dni`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RENIEC_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numero: dni }),
    });

    const data = await response.json();
    const normalized = normalizeDniResponse(data);

    if (!normalized.valido) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "DNI no válido o no existe",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: normalized,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error en dni-lookup:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Error interno del servidor",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
