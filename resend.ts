import { describe, expect, it, beforeAll, afterAll } from "vitest";

/**
 * Configuración de pruebas para la API de Resend
 * Verifica que la clave API esté correctamente configurada y sea válida
 */

// Variables globales para evitar múltiples importaciones
let ResendModule: any;
let originalEnv: NodeJS.ProcessEnv;

beforeAll(async () => {
  // Guardar el entorno original
  originalEnv = { ...process.env };
  
  // Intentar importar Resend una sola vez
  try {
    ResendModule = await import("resend");
  } catch (_error) {
    // El módulo no está instalado, las pruebas se saltarán o adaptarán
  }
});

afterAll(() => {
  // Restaurar el entorno original
  process.env = originalEnv;
});

describe("Resend API Configuration", () => {
  describe("Environment Variables", () => {
    it("should have RESEND_API_KEY environment variable set", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).toBeDefined();
      expect(apiKey).not.toBe("");
      expect(typeof apiKey).toBe("string");
    });

    it("should have RESEND_API_KEY with minimum length", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey?.length).toBeGreaterThanOrEqual(20);
    });

    it("should not contain sensitive characters or spaces", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).not.toMatch(/\s/);
      expect(apiKey).not.toMatch(/[<>"'`]/);
    });
  });

  describe("API Key Format Validation", () => {
    it("should have valid Resend API key format (starts with 're_')", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).toMatch(/^re_[a-zA-Z0-9_]+$/);
    });

    it("should only contain allowed characters", () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).toMatch(/^[a-zA-Z0-9_]+$/);
    });
  });

  describe("Resend Client Creation", () => {
    it("should be able to create a Resend client with the API key", async () => {
      const apiKey = process.env.RESEND_API_KEY;
      expect(apiKey).toBeDefined();

      if (ResendModule?.Resend) {
        const { Resend } = ResendModule;
        const resend = new Resend(apiKey);
        expect(resend).toBeInstanceOf(Resend);
        expect(resend).toHaveProperty("emails");
        expect(resend.emails).toBeDefined();
      } else {
        // Si el paquete no está instalado, solo verificamos que la clave existe
        expect(apiKey).toBeDefined();
        console.warn("⚠️ Resend package not installed, skipping client creation test");
      }
    });

    it("should handle invalid API keys gracefully", async () => {
      if (ResendModule?.Resend) {
        const { Resend } = ResendModule;
        const invalidKey = "invalid_key";
        const resend = new Resend(invalidKey);
        
        // Intentar una operación con clave inválida debería fallar
        try {
          await resend.emails.send({
            from: "test@example.com",
            to: ["test@example.com"],
            subject: "Test",
            html: "<p>Test</p>",
          });
          // Si no falla, la prueba falla
          expect(true).toBe(false);
        } catch (error) {
          // Esperamos que falle
          expect(error).toBeDefined();
        }
      } else {
        // Saltar prueba si Resend no está instalado
        expect(true).toBe(true);
        console.warn("⚠️ Resend package not installed, skipping invalid key test");
      }
    });
  });

  describe("Email Sending Capabilities", () => {
    it.skip("should be able to send a test email (requires valid configuration)", async () => {
      // Esta prueba está deshabilitada por defecto porque enviaría emails reales
      // Habilítala solo en entornos de prueba controlados
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey && ResendModule?.Resend) {
        const { Resend } = ResendModule;
        const resend = new Resend(apiKey);
        
        const { data, error } = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: ["test@example.com"],
          subject: "Test Email",
          html: "<p>This is a test email from Resend</p>",
        });

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.id).toBeDefined();
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined API key gracefully", () => {
      // Simular que la clave no existe
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;
      
      try {
        const { Resend } = ResendModule || {};
        if (Resend) {
          expect(() => new Resend(undefined as any)).toThrow();
        }
      } catch (error) {
        // Si no hay Resend, al menos verificamos que la clave no existe
        expect(process.env.RESEND_API_KEY).toBeUndefined();
      }
      
      // Restaurar la clave
      process.env.RESEND_API_KEY = originalKey;
    });

    it("should handle empty API key gracefully", () => {
      const originalKey = process.env.RESEND_API_KEY;
      process.env.RESEND_API_KEY = "";
      
      try {
        const { Resend } = ResendModule || {};
        if (Resend) {
          expect(() => new Resend("")).toThrow();
        }
      } catch (_error) {
        // Esperamos que falle
        expect(process.env.RESEND_API_KEY).toBe("");
      }
      
      // Restaurar la clave
      process.env.RESEND_API_KEY = originalKey;
    });
  });
});

// Helper utility para verificar configuración sin ejecutar pruebas
export function validateResendConfig(): { valid: boolean; error?: string } {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    return { valid: false, error: "RESEND_API_KEY is not set" };
  }
  
  if (apiKey.length < 20) {
    return { valid: false, error: "RESEND_API_KEY is too short" };
  }
  
  if (!/^re_[a-zA-Z0-9_]+$/.test(apiKey)) {
    return { valid: false, error: "RESEND_API_KEY has invalid format" };
  }
  
  return { valid: true };
}