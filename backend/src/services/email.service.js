import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

let transporter = null;

const getTransporter = () => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP_USER y SMTP_PASS deben estar configurados en el .env para enviar correos"
    );
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
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

  await getTransporter().sendMail({
    from: `"JRTech" <${SMTP_FROM}>`,
    to,
    subject: "Restablece tu contraseña en JRTech",
    text,
    html,
  });
};
