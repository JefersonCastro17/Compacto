const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const APP_NAME = process.env.APP_NAME || "Mercapleno";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const ensureResend = () => {
  if (!resend) {
    throw new Error("RESEND_API_KEY not configured");
  }
};

const buildVerificationEmail = (code, ttlMinutes) => ({
  subject: `${APP_NAME} - Codigo de verificacion`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Tu codigo de verificacion es:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</div>
      <p>Este codigo vence en ${ttlMinutes} minutos.</p>
    </div>
  `,
  text: `Tu codigo de verificacion es: ${code}. Este codigo vence en ${ttlMinutes} minutos.`
});

const buildResetEmail = (code, ttlMinutes) => ({
  subject: `${APP_NAME} - Recuperar contrasena`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Tu codigo para recuperar la contrasena es:</p>
      <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px;">${code}</div>
      <p>Este codigo vence en ${ttlMinutes} minutos.</p>
    </div>
  `,
  text: `Tu codigo para recuperar la contrasena es: ${code}. Este codigo vence en ${ttlMinutes} minutos.`
});

const sendVerificationCode = async (to, code, ttlMinutes) => {
  ensureResend();
  const payload = buildVerificationEmail(code, ttlMinutes);
  return resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
};

const sendPasswordResetCode = async (to, code, ttlMinutes) => {
  ensureResend();
  const payload = buildResetEmail(code, ttlMinutes);
  return resend.emails.send({
    from: RESEND_FROM_EMAIL,
    to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
};

module.exports = {
  sendVerificationCode,
  sendPasswordResetCode
};
