import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { contactRouter } from "./routers/contact";

/**
 * Router principal de la aplicación.
 * Todas las rutas deben comenzar con `/api/` para el correcto enrutamiento del gateway.
 * 
 * @see Para usar Socket.IO, registrar en `server/_core/index.ts`
 */
export const appRouter = router({
  // Módulo de sistema (health checks, métricas, etc.)
  system: systemRouter,

  // Módulo de autenticación
  auth: router({
    /**
     * Obtiene el usuario autenticado actual
     * @returns Usuario del contexto o null si no está autenticado
     */
    me: publicProcedure.query(({ ctx }) => ctx.user),

    /**
     * Cierra la sesión del usuario actual
     * Elimina la cookie de sesión y retorna éxito
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      try {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, {
          ...cookieOptions,
          maxAge: -1, // Forzar expiración inmediata
        });
        return { success: true };
      } catch (error) {
        // En caso de error, aún retornamos éxito para no exponer detalles internos
        // pero idealmente deberías loguearlo
        console.error("Error durante logout:", error);
        return { success: false };
      }
    }),
  }),

  // Módulo de contactos
  contact: contactRouter,
});

// Tipo exportable para el cliente y servidor
export type AppRouter = typeof appRouter;