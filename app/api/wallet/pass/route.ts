import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";

const WalletRequestSchema = z.object({
  userName: z.string(),
  savings: z.string(),
  status: z.enum(["Protegido", "En Riesgo", "Alerta"]),
  userId: z.string().optional(),
});

// Configuración de Google Wallet (Variables de entorno)
const ISSUER_ID = process.env.GOOGLE_ISSUER_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = WalletRequestSchema.parse(body);

    console.log("[Wallet API] Iniciando proceso para:", validatedData.userName);

    // Si no hay credenciales, usamos el modo simulado (Mock)
    if (!ISSUER_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
      console.warn("[Wallet API] Credenciales reales no encontradas. Usando MOCK MODE.");
      const mockJwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.mock_payload_for_google_wallet";
      const saveUrl = `https://pay.google.com/gp/v/save/${mockJwt}`;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        saveUrl,
        isMock: true,
        objectId: `sentinel_pass_${Date.now()}`
      });
    }

    // --- CONEXIÓN REAL ---
    const objectId = `${ISSUER_ID}.sentinel_pass_${Date.now()}`;
    const classId = `${ISSUER_ID}.FinancialHealthPass`;

    const claims = {
      iss: SERVICE_ACCOUNT_EMAIL,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericObjects: [
          {
            id: objectId,
            classId: classId,
            genericType: "GENERIC_TYPE_UNSPECIFIED",
            hexBackgroundColor: validatedData.status === "Protegido" ? "#16a34a" : "#dc2626",
            logo: {
              sourceUri: {
                uri: "https://raw.githubusercontent.com/antigravity/beeper/main/public/logo.png"
              }
            },
            cardTitle: {
              defaultValue: { language: "es", value: "ORIUNDO BEEPER" }
            },
            header: {
              defaultValue: { language: "es", value: "PASAPORTE DE SALUD" }
            },
            barcode: {
              type: "QR_CODE",
              value: objectId,
              alternateText: "BEEPER-PROTECT"
            },
            textModulesData: [
              {
                header: "ESTADO",
                body: validatedData.status,
                id: "status"
              },
              {
                header: "AHORRO ANUAL",
                body: validatedData.savings,
                id: "savings"
              }
            ]
          }
        ]
      }
    };

    const token = jwt.sign(claims, PRIVATE_KEY, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return NextResponse.json({
      success: true,
      saveUrl,
      isMock: false,
      objectId
    });

  } catch (error) {
    console.error("[Wallet API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Error al procesar el pase de billetera" },
      { status: 400 }
    );
  }
}
