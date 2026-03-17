import { ENV } from "./env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Envia um email usando a API Forge do Manus
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Forge API not configured");
    return false;
  }

  try {
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendEmail",
      ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    console.log(`[Email] Email sent successfully to ${payload.to}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Envia email com código de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string
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
