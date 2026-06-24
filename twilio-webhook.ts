import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { publicProcedure, router } from "../_core/trpc";

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Twilio incoming SMS webhook payload
 */
const twilioSMSSchema = z.object({
  MessageSid: z.string(),
  AccountSid: z.string(),
  MessagingServiceSid: z.string().optional(),
  From: z.string(), // Phone number sending the message
  To: z.string(), // Your Twilio phone number
  Body: z.string(), // Message content
  NumMedia: z.string().optional(),
  MediaUrl0: z.string().optional(),
  NumSegments: z.string().optional(),
  ReferralNumMedia: z.string().optional(),
  DateSent: z.string().optional(),
  Date: z.string().optional(),
});

/**
 * Twilio incoming call webhook payload
 */
const twilioCallSchema = z.object({
  CallSid: z.string(),
  AccountSid: z.string(),
  From: z.string(), // Caller's phone number
  To: z.string(), // Your business phone number
  CallStatus: z.enum(["ringing", "in-progress", "completed", "failed", "busy", "no-answer"]),
  Direction: z.enum(["inbound", "outbound-api", "outbound-dial"]),
  Duration: z.string().optional(),
  RecordingUrl: z.string().optional(),
  ApiVersion: z.string().optional(),
});

type TwilioSMS = z.infer<typeof twilioSMSSchema>;
type TwilioCall = z.infer<typeof twilioCallSchema>;

// ============================================================================
// CONFIGURATION
// ============================================================================

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const CONTACT_EMAILS = {
  primary: "moisesdavila2005@gmail.com",
  secondary: "info@nicehomecareservices.com",
  cc: "migdaliadav.usa@gmail.com",
} as const;

const EMAIL_FROM = process.env.EMAIL_FROM || "Nice Home Care Services <info@nicehomecareservices.com>";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Escapa HTML para prevenir XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Formatea número telefónico
 */
function formatPhoneNumber(phone: string): string {
  // Si ya está formateado con +, devuelve tal cual
  if (phone.startsWith("+")) return phone;
  // Si es formato US, agrega el +1
  if (phone.match(/^1?\d{10}$/)) return `+1${phone.slice(-10)}`;
  return phone;
}

/**
 * Genera email para SMS recibido
 */
function generateSMSEmail(sms: TwilioSMS): string {
  const date = new Date().toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incoming SMS Message</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #7A9B8E;">
      <h1 style="color: #1a1a1a; font-size: 24px; margin: 0; font-weight: 600;">📱 Incoming SMS Message</h1>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px;">Received: ${date}</p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px 16px; background-color: #f8f9fa; padding: 16px; border-radius: 8px;">
        <div style="color: #6b7280; font-weight: 500;">From:</div>
        <div style="color: #1a1a1a;">
          <a href="tel:${escapeHtml(sms.From)}" style="color: #7A9B8E; text-decoration: none;">
            ${escapeHtml(formatPhoneNumber(sms.From))}
          </a>
        </div>
        
        <div style="color: #6b7280; font-weight: 500;">Message ID:</div>
        <div style="color: #1a1a1a; font-family: monospace; font-size: 12px;">${escapeHtml(sms.MessageSid)}</div>
        
        <div style="color: #6b7280; font-weight: 500;">Segments:</div>
        <div style="color: #1a1a1a;">${sms.NumSegments || '1'}</div>
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Message:</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; color: #374151; line-height: 1.6;">
        ${escapeHtml(sms.Body)}
      </div>
    </div>
    
    <div style="background-color: #f0f7f4; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #7A9B8E;">
      <p style="margin: 0; font-size: 14px; color: #4a5568;">
        💡 <strong>Action:</strong> Reply to this message directly or use your SMS panel to respond.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">This is an incoming SMS from your Twilio line.</p>
      <p style="margin: 4px 0 0;">To: ${escapeHtml(sms.To)}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Genera email para llamada recibida
 */
function generateCallEmail(call: TwilioCall): string {
  const date = new Date().toLocaleString("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const statusColor =
    call.CallStatus === "completed" ? "#10b981" :
    call.CallStatus === "no-answer" ? "#f59e0b" :
    call.CallStatus === "failed" ? "#ef4444" :
    "#7A9B8E";

  const statusLabel =
    call.CallStatus === "completed" ? "✅ Completed" :
    call.CallStatus === "no-answer" ? "⏱️ No Answer" :
    call.CallStatus === "failed" ? "❌ Failed" :
    "📞 " + call.CallStatus.charAt(0).toUpperCase() + call.CallStatus.slice(1);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incoming Call Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #7A9B8E;">
      <h1 style="color: #1a1a1a; font-size: 24px; margin: 0; font-weight: 600;">☎️ Incoming Call</h1>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px;">Received: ${date}</p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px 16px; background-color: #f8f9fa; padding: 16px; border-radius: 8px;">
        <div style="color: #6b7280; font-weight: 500;">From:</div>
        <div style="color: #1a1a1a;">
          <a href="tel:${escapeHtml(call.From)}" style="color: #7A9B8E; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${escapeHtml(formatPhoneNumber(call.From))}
          </a>
        </div>
        
        <div style="color: #6b7280; font-weight: 500;">Status:</div>
        <div style="color: ${statusColor}; font-weight: 600;">${statusLabel}</div>
        
        <div style="color: #6b7280; font-weight: 500;">Duration:</div>
        <div style="color: #1a1a1a;">${call.Duration ? call.Duration + ' seconds' : 'N/A'}</div>
        
        <div style="color: #6b7280; font-weight: 500;">Call ID:</div>
        <div style="color: #1a1a1a; font-family: monospace; font-size: 12px;">${escapeHtml(call.CallSid)}</div>
      </div>
    </div>

    ${call.RecordingUrl ? `
    <div style="margin-bottom: 24px;">
      <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Recording:</h2>
      <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px;">
        <a href="${escapeHtml(call.RecordingUrl)}" style="color: #7A9B8E; text-decoration: none; font-weight: 600; padding: 8px 16px; background-color: #f0f7f4; border-radius: 6px; display: inline-block;">
          🎙️ Listen to Recording
        </a>
      </div>
    </div>
    ` : ''}
    
    <div style="background-color: #f0f7f4; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #7A9B8E;">
      <p style="margin: 0; font-size: 14px; color: #4a5568;">
        💡 <strong>Action:</strong> Check your call logs for more details or retrieve the recording if available.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">This is an incoming call notification from your Twilio line.</p>
      <p style="margin: 4px 0 0;">To: ${escapeHtml(call.To)}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Envía notificación de SMS por email
 */
async function notifySMSByEmail(sms: TwilioSMS): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[Twilio] Resend not configured, skipping SMS notification email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const emailHtml = generateSMSEmail(sms);
    const textVersion = `
Incoming SMS Message
From: ${formatPhoneNumber(sms.From)}
Message ID: ${sms.MessageSid}

Message:
${sms.Body}
    `;

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [CONTACT_EMAILS.primary, CONTACT_EMAILS.secondary],
      cc: [CONTACT_EMAILS.cc],
      subject: `📱 Incoming SMS from ${formatPhoneNumber(sms.From)}`,
      html: emailHtml,
      text: textVersion,
    });

    if (response.error) {
      console.error("[Twilio] SMS notification email error:", response.error);
      return { success: false, error: response.error.message };
    }

    console.info(`[Twilio] SMS notification email sent for message ${sms.MessageSid}`);
    return { success: true };
  } catch (error) {
    console.error("[Twilio] SMS notification email exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

/**
 * Envía notificación de llamada por email
 */
async function notifyCallByEmail(call: TwilioCall): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[Twilio] Resend not configured, skipping call notification email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const emailHtml = generateCallEmail(call);
    const textVersion = `
Incoming Call Notification
From: ${formatPhoneNumber(call.From)}
Status: ${call.CallStatus}
Duration: ${call.Duration ? call.Duration + ' seconds' : 'N/A'}
Call ID: ${call.CallSid}
    `;

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [CONTACT_EMAILS.primary, CONTACT_EMAILS.secondary],
      cc: [CONTACT_EMAILS.cc],
      subject: `☎️ Incoming Call from ${formatPhoneNumber(call.From)} - ${call.CallStatus}`,
      html: emailHtml,
      text: textVersion,
    });

    if (response.error) {
      console.error("[Twilio] Call notification email error:", response.error);
      return { success: false, error: response.error.message };
    }

    console.info(`[Twilio] Call notification email sent for call ${call.CallSid}`);
    return { success: true };
  } catch (error) {
    console.error("[Twilio] Call notification email exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

// ============================================================================
// ROUTER
// ============================================================================

export const twilioRouter = router({
  /**
   * Webhook para recibir SMS entrantes
   * Público - Twilio llama a este endpoint
   */
  smsWebhook: publicProcedure
    .input(z.record(z.any())) // Twilio sends form data
    .mutation(async ({ input }) => {
      try {
        // Validar estructura de Twilio SMS
        const sms = twilioSMSSchema.parse(input);

        console.info(`[Twilio] Incoming SMS from ${sms.From}: "${sms.Body.substring(0, 50)}..."`);

        // Guardar en base de datos si existe la tabla
        // await createContactSubmission({...})

        // Enviar notificación por email
        const emailResult = await notifySMSByEmail(sms);

        // Log de resultado
        if (!emailResult.success) {
          console.warn(`[Twilio] SMS email notification failed: ${emailResult.error}`);
        }

        return {
          success: true,
          message: "SMS received and processed",
          messageSid: sms.MessageSid,
          emailNotified: emailResult.success,
        };
      } catch (error) {
        console.error("[Twilio] SMS webhook error:", error);
        
        if (error instanceof z.ZodError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid SMS webhook payload: ${error.issues.map(i => i.code).join(", ")}`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process SMS webhook",
        });
      }
    }),

  /**
   * Webhook para recibir notificaciones de llamadas entrantes
   * Público - Twilio llama a este endpoint
   */
  callWebhook: publicProcedure
    .input(z.record(z.any())) // Twilio sends form data
    .mutation(async ({ input }) => {
      try {
        // Validar estructura de Twilio call
        const call = twilioCallSchema.parse(input);

        console.info(`[Twilio] Incoming call from ${call.From} - Status: ${call.CallStatus}`);

        // Enviar notificación por email
        const emailResult = await notifyCallByEmail(call);

        // Log de resultado
        if (!emailResult.success) {
          console.warn(`[Twilio] Call email notification failed: ${emailResult.error}`);
        }

        return {
          success: true,
          message: "Call notification processed",
          callSid: call.CallSid,
          emailNotified: emailResult.success,
        };
      } catch (error) {
        console.error("[Twilio] Call webhook error:", error);

        if (error instanceof z.ZodError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid call webhook payload: ${error.issues.map(i => i.code).join(", ")}`,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process call webhook",
        });
      }
    }),
});

export type TwilioRouter = typeof twilioRouter;
