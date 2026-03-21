import { Resend } from "resend";
import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envia um email usando o Resend
 * Em modo de teste, o Resend só permite enviar para o email do proprietário (testemanus221@gmail.com)
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] Resend API key not configured");
    return false;
  }

  try {
    console.log(`[Email] Sending email to ${payload.to}`);

    // Em modo de teste, redirecionar para email pessoal
    const toEmail = process.env.NODE_ENV === "production" ? payload.to : "testemanus221@gmail.com";
    console.log(`[Email] Actual recipient: ${toEmail}`);

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: toEmail,
      subject: payload.subject,
      html: payload.html,
    });

    if (response.error) {
      console.error(`[Email] Failed to send email:`);
      console.error(`  Error name: ${response.error.name}`);
      console.error(`  Error message: ${response.error.message}`);
      console.error(`  Full error:`, JSON.stringify(response.error, null, 2));
      return false;
    }

    console.log(`[Email] Email sent successfully to ${toEmail}. ID: ${response.data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Envia email com código de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  fromEmail?: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
          .code { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; letter-spacing: 5px; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperação de Senha</h1>
          </div>
          <div class="content">
            <p>Olá,</p>
            <p>Recebemos uma solicitação para recuperar sua senha. Use o código abaixo para redefinir sua senha:</p>
            <div class="code">${code}</div>
            <p>Este código expira em 1 hora.</p>
            <p>Se você não solicitou esta recuperação de senha, ignore este email.</p>
            <div class="footer">
              <p>&copy; 2026 TechConnect. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Código de Recuperação de Senha - TechConnect",
    html,
  });
}
