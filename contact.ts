import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { publicProcedure, router, protectedProcedure } from "../_core/trpc";
import {
  createContactSubmission,
  updateContactSubmissionStatus,
  getContactSubmissions,
  getContactSubmissionById,
  deleteContactSubmission,
  withTransaction,
} from "../database/db";
import { UserRole, ContactStatus } from "../../drizzle/schema";
import { ENV } from "../_core/env";
import { emailQueue } from "../_core/queue";

// 
// CONSTANTS & CONFIGURACIÓN
// 

// Inicializar Resend solo si la API key está configurada

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const CONTACT_EMAILS = {
  primary: "migdaliadav.usa@gmail.com",
  secondary: "moisesdavila2005@gmail.com",
} as const;

const EMAIL_FROM = process.env.EMAIL_FROM || "Nice Home Care Services <onboarding@resend.dev>";

// 
// VALIDATION SCHEMAS
// 

// Schema base con validaciones mejoradas

const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name is too long")
    .regex(/^[a-zA-ZáéíóúñÑ\s\-']+$/, "Name contains invalid characters"),
  
  email: z
    .string()
    .email("Invalid email address")
    .max(320, "Email is too long")
    .toLowerCase(),
  
  phone: z
    .string()
    .min(7, "Phone must be at least 7 characters")
    .max(20, "Phone is too long")
    .regex(/^[+]?[\d\s\-()]+$/, "Invalid phone number format")
    .optional()
    .default(""),
  
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long")
    .refine(
      (val) => !/(https?:\/\/|www\.)/i.test(val),
      "Message should not contain URLs"
    ),
  
  wantsReply: z.boolean().optional().default(true),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Schema para actualización de estado (solo admin)
const updateStatusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum([ContactStatus.PENDING, ContactStatus.SENT, ContactStatus.FAILED, ContactStatus.SPAM, ContactStatus.ARCHIVED]),
});

// Schema para paginación y filtros
const listFilterSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
  status: z.enum([ContactStatus.PENDING, ContactStatus.SENT, ContactStatus.FAILED, ContactStatus.SPAM, ContactStatus.ARCHIVED]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "email", "status"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// 
// HELPERS

// Escapa HTML para prevenir XSS
 
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

// Genera el HTML del email de notificación
//
function generateContactEmail(input: ContactFormInput, submissionId: number): string {
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
  <title>New Contact Form Submission</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #7A9B8E;">
      <h1 style="color: #1a1a1a; font-size: 24px; margin: 0; font-weight: 600;">📩 New Contact Message</h1>
      <p style="color: #666; margin: 8px 0 0; font-size: 14px;">Received: ${date}</p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 8px 16px; background-color: #f8f9fa; padding: 16px; border-radius: 8px;">
        <div style="color: #6b7280; font-weight: 500;">Name:</div>
        <div style="color: #1a1a1a;">${escapeHtml(input.name)}</div>
        
        <div style="color: #6b7280; font-weight: 500;">Email:</div>
        <div style="color: #1a1a1a;">
          <a href="mailto:${escapeHtml(input.email)}" style="color: #7A9B8E; text-decoration: none;">
            ${escapeHtml(input.email)}
          </a>
        </div>
        
        <div style="color: #6b7280; font-weight: 500;">Phone:</div>
        <div style="color: #1a1a1a;">${escapeHtml(input.phone) || 'Not provided'}</div>
        
        <div style="color: #6b7280; font-weight: 500;">Wants Reply:</div>
        <div style="color: #1a1a1a;">${input.wantsReply ? '✅ Yes' : '❌ No'}</div>
        
        <div style="color: #6b7280; font-weight: 500;">Submission ID:</div>
        <div style="color: #1a1a1a; font-family: monospace;">#${submissionId}</div>
      </div>
    </div>
    
    <div style="margin-bottom: 24px;">
      <h2 style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Message:</h2>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; color: #374151; line-height: 1.6;">
        ${escapeHtml(input.message)}
      </div>
    </div>
    
    <div style="background-color: #f0f7f4; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #7A9B8E;">
      <p style="margin: 0; font-size: 14px; color: #4a5568;">
        💡 <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
      </p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">This email was sent from the Nice Home Care Services contact form.</p>
      <p style="margin: 4px 0 0;">ID: #${submissionId}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Envía el email de notificación
 //
async function sendContactNotification(
  input: ContactFormInput,
  submissionId: number
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn("[Contact] Resend not configured, skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const emailHtml = generateContactEmail(input, submissionId);
    const textVersion = `
New Contact Message from ${input.name}
Received: ${new Date().toLocaleString()}

Name: ${input.name}
Email: ${input.email}
Phone: ${input.phone || 'Not provided'}

Message:
${input.message}


Submission ID: #${submissionId}
    `;

    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to: [CONTACT_EMAILS.primary],
      cc: [CONTACT_EMAILS.secondary],
      subject: `New Contact Form Submission from ${input.name}`,
      html: emailHtml,
      text: textVersion,
    });

    if (response.error) {
      console.error("[Contact] Email send error:", response.error);
      return { success: false, error: response.error.message };
    }

    console.info(`[Contact] Email sent successfully for submission #${submissionId}`);
    return { success: true };
  } catch (error) {
    console.error("[Contact] Email send exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

// 
// ROUTER
// 

export const contactRouter = router({
  //
   // Envía un mensaje de contacto
   // Público - No requiere autenticación
 //
  submit: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input, ctx }) => {
      const startTime = Date.now();
      let submissionId: number | null = null;

      try {
        // Validar spam básico

        if (input.message.includes("http") || input.message.includes("www")) {
          console.warn("[Contact] Spam detected - URL in message", { email: input.email });
        
 //  Si tiene URL, lo marcamos como spam directamente
          const spamSubmission = await createContactSubmission({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            message: input.message,
            status: ContactStatus.SPAM,
            wantsReply: false,
            ipAddress: ctx.req?.headers?.["x-forwarded-for"] || ctx.req?.socket?.remoteAddress,
            userAgent: ctx.req?.headers?.["user-agent"],
          });

  //  No notificamos sobre spam
          return {
            success: true,
            message: "Thank you for your message. We'll get back to you soon!",
            submissionId: spamSubmission?.id || 0,
            flagged: true,
          };
        }

        // Guardar en base de datos con transacción

        let emailResult = { success: false, error: "Email not sent" };

        const submission = await withTransaction(async (tx) => {
         
 //  Crear submission

          const newSubmission = await createContactSubmission({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            message: input.message,
            status: ContactStatus.PENDING,
            wantsReply: input.wantsReply,
            ipAddress: ctx.req?.headers?.["x-forwarded-for"] as string || ctx.req?.socket?.remoteAddress as string,
            userAgent: ctx.req?.headers?.["user-agent"] as string,
          });

          if (!newSubmission) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create submission",
            });
          }

          submissionId = newSubmission.id;

          // Enviar email
          
emailResult = await sendContactNotification(input, submissionId);

          // Actualizar estado según resultado del email
          const status = emailResult.success ? ContactStatus.SENT : ContactStatus.FAILED;
          await updateContactSubmissionStatus(submissionId, status);

          return newSubmission;
        });

        const duration = Date.now() - startTime;
        console.info(`[Contact] Submission #${submissionId} processed in ${duration}ms`);

        // Log de alerta si el email falló
       
 if (!emailResult.success) {
          console.warn(`[Contact] Email failed for submission #${submissionId}: ${emailResult.error}`);
        }

        return {
          success: true,
          message: emailResult.success
            ? "Thank you! Your message has been sent successfully."
            : "Your message was saved, but we're having trouble with email notifications.",
          submissionId,
          emailSent: emailResult.success,
        };
      } catch (error) {
        console.error("[Contact] Submission error:", error);

        // Si el error es un TRPCError, lo propagamos
       
 if (error instanceof TRPCError) {
          throw error;
        }

        // Si la submission se creó pero falló el email, actualizar estado
       
 if (submissionId) {
          try {
            await updateContactSubmissionStatus(submissionId, ContactStatus.FAILED);
          } catch (updateError) {
            console.error(`[Contact] Failed to update status for #${submissionId}:`, updateError);
          }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred while processing your request. Please try again later.",
        });
      }
    }),

  // Lista todas las submissions de contacto
  // Protegido - Solo usuarios autenticados
   
  list: protectedProcedure
    .input(listFilterSchema)
    .query(async ({ input, ctx }) => {
      // Verificar que el usuario tenga permisos de admin
      if (ctx.user?.role !== UserRole.ADMIN && ctx.user?.role !== UserRole.SUPER_ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view contact submissions",
        });
      }

      try {
        const { page, limit, status, search, sortBy, sortOrder } = input;

        const result = await getContactSubmissions(
          {
            page,
            limit,
            sortBy,
            sortOrder,
          },
          {
            status: status as ContactStatus | undefined,
            search,
          }
        );

        return {
          success: true,
          submissions: result.submissions,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        };
      } catch (error) {
        console.error("[Contact] List error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch submissions",
        });
      }
    }),

  // Obtiene una submission específica
  // Protegido - Solo usuarios autenticados
   
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      // Verificar permisos
     
  if (ctx.user?.role !== UserRole.ADMIN && ctx.user?.role !== UserRole.SUPER_ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this submission",
        });
      }

      try {
        const submission = await getContactSubmissionById(input.id);

        if (!submission) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Submission not found",
          });
        }

        return { success: true, submission };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(`[Contact] GetById error for #${input.id}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch submission",
        });
      }
    }),

  // Actualiza el estado de una submission
   // Protegido - Solo administradores
   
  updateStatus: protectedProcedure
    .input(updateStatusSchema)
    .mutation(async ({ input, ctx }) => {
      // Verificar permisos
      if (ctx.user?.role !== UserRole.ADMIN && ctx.user?.role !== UserRole.SUPER_ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update submissions",
        });
      }

      try {
        const { id, status } = input;

        // Verificar que la submission existe
       
 const existing = await getContactSubmissionById(id);
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Submission not found",
          });
        }

        const updated = await updateContactSubmissionStatus(id, status);

        return {
          success: true,
          submission: updated,
          message: `Status updated to ${status}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(`[Contact] UpdateStatus error for #${input.id}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update submission status",
        });
      }
    }),

  // Elimina una submission
  //Protegido - Solo super administradores
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input, ctx }) => {
      // Solo super admin puede eliminar
      if (ctx.user?.role !== UserRole.SUPER_ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete submissions",
        });
      }

      try {
        const deleted = await deleteContactSubmission(input.id);

        if (!deleted) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Submission not found or already deleted",
          });
        }

        return {
          success: true,
          message: "Submission deleted successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error(`[Contact] Delete error for #${input.id}:`, error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete submission",
        });
      }
    }),

  // Estadísticas de submissions
   // Protegido - Solo administradores
   
  stats: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user?.role !== UserRole.ADMIN && ctx.user?.role !== UserRole.SUPER_ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view statistics",
        });
      }

      try {
       
 // Obtener todas las submissions para calcular estadísticas
       
 const { submissions } = await getContactSubmissions({ limit: 1000 });

        const stats = {
          total: submissions.length,
          byStatus: {
            [ContactStatus.PENDING]: 0,
            [ContactStatus.SENT]: 0,
            [ContactStatus.FAILED]: 0,
            [ContactStatus.SPAM]: 0,
            [ContactStatus.ARCHIVED]: 0,
          },
          recent: submissions
            .filter(s => s.status === ContactStatus.PENDING)
            .length,
          today: submissions.filter(s => {
            const today = new Date();
            const created = new Date(s.createdAt);
            return created.toDateString() === today.toDateString();
          }).length,
        };

        // Contar por estado
       
 submissions.forEach(s => {
          if (s.status in stats.byStatus) {
            stats.byStatus[s.status as keyof typeof stats.byStatus]++;
          }
        });

        return { success: true, stats };
      } catch (error) {
        console.error("[Contact] Stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch statistics",
        });
      }
    }),
});

// 
// EXPORT TYPES
// 

export type ContactRouter = typeof contactRouter;
