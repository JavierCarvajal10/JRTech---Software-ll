// Envío de correos vía la API HTTP de Brevo (https://www.brevo.com).
// Usamos HTTP (puerto 443) en lugar de SMTP porque Render Free BLOQUEA los
// puertos SMTP salientes (25/465/587). HTTPS no está bloqueado, así que esto
// funciona tanto en local como en producción.

const BREVO_API_KEY = process.env.BREVO_API_KEY;
// Remitente: debe ser un correo verificado en Brevo (Senders & IP).
// Se normaliza a minúsculas porque Brevo compara el remitente de forma exacta
// y solo reconoce el que verificaste (que queda en minúsculas).
const EMAIL_FROM = (process.env.EMAIL_FROM || process.env.SMTP_FROM || process.env.SMTP_USER || "").toLowerCase();
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "JRTech";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/**
 * Envía un correo transaccional por la API de Brevo.
 * Lanza un Error (con detalle para los logs) si algo falla.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY no está configurada en las variables de entorno");
  }
  if (!EMAIL_FROM) {
    throw new Error("EMAIL_FROM (o SMTP_FROM) no está configurado para el remitente");
  }

  // Timeout defensivo: si la API no responde en 15s, abortamos (no colgamos).
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
        to: [{ email: to }],
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo respondió ${response.status}: ${detail}`);
  }
};

export const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${FRONTEND_URL}/restablecer-password?token=${encodeURIComponent(token)}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #111827;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 800;">
          <span style="color: #111827;">Jero</span><span style="color: #9146FF;">Tech</span>
        </h1>
      </div>

      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px;">
        <h2 style="margin: 0 0 16px; font-size: 22px; color: #111827;">Hola ${name || ""},</h2>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #4b5563;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en JRTech.
          Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace
          es válido por <strong>1 hora</strong>.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #9146FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 700; font-size: 15px;">
            Restablecer contraseña
          </a>
        </div>

        <p style="margin: 0 0 8px; font-size: 13px; color: #6b7280;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:
        </p>
        <p style="margin: 0 0 24px; font-size: 13px; color: #9146FF; word-break: break-all;">
          ${resetUrl}
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.6;">
          Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura.
          Tu contraseña actual no será modificada.
        </p>
      </div>

      <p style="text-align: center; margin: 24px 0 0; font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} JRTech · Ibagué, Colombia
      </p>
    </div>
  `;

  const text = `Hola ${name || ""},

Recibimos una solicitud para restablecer la contraseña de tu cuenta en JRTech.
Abre el siguiente enlace para crear una nueva contraseña (válido por 1 hora):

${resetUrl}

Si tú no solicitaste este cambio, puedes ignorar este correo.`;

  await sendEmail({
    to,
    subject: "Restablece tu contraseña en JRTech",
    html,
    text,
  });
};
