import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  console.log("Incoming request:", req.method, req.url);

  // Manejar CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Solo GET permitido
    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Método no permitido",
        }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar autenticación
    const authHeader = req.headers.get("Authorization");
    console.log("Auth header:", authHeader ? "presente" : "ausente");

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
    const pathParts = url.pathname.split("/").filter(Boolean);
    const dni = pathParts[pathParts.length - 1];

    console.log("DNI extraído:", dni);

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
      console.error("RENIEC_API_KEY no está configurada");
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

    console.log("Llamando a RENIEC API para DNI:", dni);

    // Llamar a Decolecta. En GET el DNI debe viajar como query param, no en body.
    const decolectaUrl = new URL(`${RENIEC_API_URL}/v1/reniec/dni`);
    decolectaUrl.searchParams.set("numero", dni);

    const response = await fetch(decolectaUrl.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RENIEC_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("RENIEC Response status:", response.status);

    const data = await response.json();
    console.log("RENIEC Response data:", data);

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
    console.error("Error en dni:", error);
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

