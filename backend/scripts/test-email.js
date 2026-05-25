// Script de prueba: envía un correo de recuperación real para verificar SMTP.
// Uso:  node scripts/test-email.js [correo-destino]
// Si no pasas destino, se envía a SMTP_USER (a ti mismo).
import "dotenv/config";
import { sendPasswordResetEmail } from "../src/services/email.service.js";

const from = process.env.EMAIL_FROM || process.env.SMTP_FROM;
const to = process.argv[2] || from;

console.log("Remitente (from):", from || "(undefined)");
console.log("Enviando correo de prueba a:", to);

try {
  await sendPasswordResetEmail({
    to,
    name: "Prueba",
    token: "TOKEN-DE-PRUEBA-1234567890",
  });
  console.log("\n✅ Correo enviado correctamente. Revisa la bandeja (y spam) de", to);
  process.exit(0);
} catch (err) {
  console.error("\n❌ Falló el envío:", err.message);
  process.exit(1);
}
