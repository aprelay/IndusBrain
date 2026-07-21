import nodemailer from "nodemailer";

function getTransport(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

/** Fire-and-forget email; silently no-op when SMTP is not configured. */
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const transport = getTransport();
  if (!transport) return;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  try {
    await transport.sendMail({ from, to, subject, text });
  } catch (err) {
    console.error("email send failed:", err);
  }
}

export function notifyOwner(subject: string, text: string): void {
  const owner = process.env.NOTIFY_EMAIL;
  if (!owner) return;
  void sendEmail(owner, subject, text);
}
