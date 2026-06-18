import { and, desc, eq, gt, SQL, sql } from "drizzle-orm";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import {
  users,
  contactSubmissions,
  InsertUser,
  UpdateUser,
  User,
  InsertContactSubmission,
  UpdateContactSubmission,
  ContactSubmission,
  UserRole,
  ContactStatus,
  isActiveUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// ============================================================================
// TYPES
// ============================================================================

type DbInstance = MySql2Database<Record<string, unknown>>;

interface DbConfig {
  connectionString: string;
  maxRetries?: number;
  retryDelay?: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface ContactFilterOptions {
  status?: ContactStatus;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 50,
  sortBy: "createdAt",
  sortOrder: "desc" as const,
};

const DB_CONFIG: DbConfig = {
  connectionString: process.env.DATABASE_URL || "",
  maxRetries: 3,
  retryDelay: 1000,
};

// ============================================================================
// SINGLETON DB INSTANCE
// ============================================================================

let _db: DbInstance | null = null;
let _connectionAttempts = 0;
let _lastConnectionError: Error | null = null;

/**
 * Obtiene la instancia de la base de datos con lazy loading y reintentos
 */
export async function getDb(): Promise<DbInstance | null> {
  if (_db) return _db;

  if (!DB_CONFIG.connectionString) {
    console.warn("[Database] DATABASE_URL not configured");
    return null;
  }

  try {
    _db = drizzle(DB_CONFIG.connectionString);
    _connectionAttempts = 0;
    _lastConnectionError = null;
    
    // Verificar conexión con un query simple
    await _db.execute(sql`SELECT 1`);
    console.info("[Database] Connected successfully");
    
    return _db;
  } catch (error) {
    _connectionAttempts++;
    _lastConnectionError = error as Error;
    console.error(`[Database] Connection failed (attempt ${_connectionAttempts}):`, error);
    
    if (_connectionAttempts < (DB_CONFIG.maxRetries || 3)) {
      console.info(`[Database] Retrying in ${DB_CONFIG.retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, DB_CONFIG.retryDelay));
      return getDb();
    }
    
    return null;
  }
}

/**
 * Verifica si la base de datos está disponible
 */
export async function isDbAvailable(): Promise<boolean> {
  const db = await getDb();
  return db !== null;
}

/**
 * Reinicia la conexión a la base de datos
 */
export async function resetDbConnection(): Promise<void> {
  _db = null;
  _connectionAttempts = 0;
  _lastConnectionError = null;
}

/**
 * Obtiene el último error de conexión
 */
export function getLastConnectionError(): Error | null {
  return _lastConnectionError;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Verifica el estado de la base de datos
 */
export async function healthCheck(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    const db = await getDb();
    if (!db) {
      return { healthy: false, error: "Database not available" };
    }
    
    await db.execute(sql`SELECT 1`);
    const latency = Date.now() - start;
    
    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

/**
 * Crea o actualiza un usuario
 */
export async function upsertUser(
  user: InsertUser,
  options?: { skipAdminCheck?: boolean }
): Promise<User | null> {
  if (!user.openId) {
    throw new Error("[Database] User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return null;
  }

  try {
    // Construir valores base
    const values: InsertUser = {
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? UserRole.USER,
      emailVerified: user.emailVerified ?? false,
      isActive: user.isActive ?? true,
      avatar: user.avatar ?? null,
      preferences: user.preferences ?? null,
      lastIp: user.lastIp ?? null,
      lastUserAgent: user.lastUserAgent ?? null,
      lastSignedIn: user.lastSignedIn ?? new Date(),
    };

    // Asignar admin automáticamente si es el owner
    if (!options?.skipAdminCheck && user.openId === ENV.ownerOpenId) {
      values.role = UserRole.ADMIN;
    }

    // Preparar campos para actualización
    const updateSet: Partial<InsertUser> = {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      role: values.role,
      emailVerified: values.emailVerified,
      isActive: values.isActive,
      avatar: values.avatar,
      preferences: values.preferences,
      lastIp: values.lastIp,
      lastUserAgent: values.lastUserAgent,
      lastSignedIn: values.lastSignedIn,
      updatedAt: new Date(),
    };

    // Ejecutar upsert
    const result = await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });

    // Recuperar el usuario actualizado
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.openId, user.openId))
      .limit(1);

    return userResult[0] || null;
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw new Error(
      `Failed to upsert user: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Obtiene un usuario por su openId
 */
export async function getUserByOpenId(openId: string): Promise<User | null> {
  if (!openId) {
    throw new Error("[Database] openId is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[Database] Failed to get user by openId ${openId}:`, error);
    throw error;
  }
}

/**
 * Obtiene un usuario por su email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!email) {
    throw new Error("[Database] email is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[Database] Failed to get user by email ${email}:`, error);
    throw error;
  }
}

/**
 * Obtiene usuarios con paginación y filtros
 */
export async function getUsers(
  options: PaginationOptions = {},
  filter?: { role?: UserRole; isActive?: boolean }
): Promise<{ users: User[]; total: number }> {
  const { page = 1, limit = 50, sortBy = "createdAt", sortOrder = "desc" } = options;
  const offset = (page - 1) * limit;

  const db = await getDb();
  if (!db) {
    return { users: [], total: 0 };
  }

  try {
    // Construir condiciones de filtro
    const conditions: SQL[] = [];
    if (filter?.role) {
      conditions.push(eq(users.role, filter.role));
    }
    if (filter?.isActive !== undefined) {
      conditions.push(eq(users.isActive, filter.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Obtener total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);

    // Obtener datos
    const orderColumn = users[sortBy as keyof typeof users] || users.createdAt;
    const orderFn = sortOrder === "asc" ? sql`ASC` : sql`DESC`;

    const results = await db
      .select()
      .from(users)
      .where(whereClause)
      .orderBy(orderColumn, orderFn)
      .limit(limit)
      .offset(offset);

    return { users: results, total };
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    return { users: [], total: 0 };
  }
}

/**
 * Actualiza un usuario
 */
export async function updateUser(
  openId: string,
  data: UpdateUser
): Promise<User | null> {
  if (!openId) {
    throw new Error("[Database] openId is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return null;
  }

  try {
    // Remover campos que no se deben actualizar
    const { id, openId: _openId, createdAt, ...updateData } = data as any;

    await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.openId, openId));

    return getUserByOpenId(openId);
  } catch (error) {
    console.error(`[Database] Failed to update user ${openId}:`, error);
    throw error;
  }
}

/**
 * Elimina un usuario (soft delete)
 */
export async function deleteUser(openId: string): Promise<boolean> {
  if (!openId) {
    throw new Error("[Database] openId is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete user: database not available");
    return false;
  }

  try {
    const result = await db
      .update(users)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.openId, openId));

    return true;
  } catch (error) {
    console.error(`[Database] Failed to delete user ${openId}:`, error);
    throw error;
  }
}

/**
 * Actualiza el último inicio de sesión de un usuario
 */
export async function updateLastSignIn(openId: string): Promise<void> {
  if (!openId) {
    throw new Error("[Database] openId is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update last sign in: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({
        lastSignedIn: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.openId, openId));
  } catch (error) {
    console.error(`[Database] Failed to update last sign in for ${openId}:`, error);
    throw error;
  }
}

// ============================================================================
// CONTACT SUBMISSIONS OPERATIONS
// ============================================================================

/**
 * Crea una nueva submission de contacto
 */
export async function createContactSubmission(
  data: InsertContactSubmission
): Promise<ContactSubmission | null> {
  if (!data.email || !data.name || !data.message) {
    throw new Error("[Database] Email, name, and message are required");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Database not available");
  }

  try {
    const values: InsertContactSubmission = {
      ...data,
      status: data.status || ContactStatus.PENDING,
      priority: data.priority || "medium",
      wantsReply: data.wantsReply ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(contactSubmissions).values(values);
    const id = Number(result.insertId);

    const submission = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    return submission[0] || null;
  } catch (error) {
    console.error("[Database] Failed to create contact submission:", error);
    throw new Error(
      `Failed to create contact submission: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Actualiza el estado de una submission de contacto
 */
export async function updateContactSubmissionStatus(
  id: number,
  status: ContactStatus
): Promise<ContactSubmission | null> {
  if (!id) {
    throw new Error("[Database] Submission ID is required");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Database not available");
  }

  try {
    await db
      .update(contactSubmissions)
      .set({
        status,
        updatedAt: new Date(),
        processedAt: status === ContactStatus.SENT ? new Date() : undefined,
      })
      .where(eq(contactSubmissions.id, id));

    const result = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[Database] Failed to update contact submission ${id}:`, error);
    throw error;
  }
}

/**
 * Obtiene submissions de contacto con filtros y paginación
 */
export async function getContactSubmissions(
  options: PaginationOptions = {},
  filter?: ContactFilterOptions
): Promise<{ submissions: ContactSubmission[]; total: number }> {
  const { page = 1, limit = 50, sortBy = "createdAt", sortOrder = "desc" } = options;
  const offset = (page - 1) * limit;

  const db = await getDb();
  if (!db) {
    return { submissions: [], total: 0 };
  }

  try {
    // Construir condiciones de filtro
    const conditions: SQL[] = [];

    if (filter?.status) {
      conditions.push(eq(contactSubmissions.status, filter.status));
    }

    if (filter?.fromDate) {
      conditions.push(gt(contactSubmissions.createdAt, filter.fromDate));
    }

    if (filter?.toDate) {
      conditions.push(sql`${contactSubmissions.createdAt} <= ${filter.toDate}`);
    }

    if (filter?.search) {
      const searchTerm = `%${filter.search}%`;
      conditions.push(
        sql`${contactSubmissions.name} LIKE ${searchTerm} OR ${contactSubmissions.email} LIKE ${searchTerm} OR ${contactSubmissions.message} LIKE ${searchTerm}`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Obtener total
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(contactSubmissions)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);

    // Obtener datos
    const orderColumn = contactSubmissions[sortBy as keyof typeof contactSubmissions] || contactSubmissions.createdAt;
    const orderFn = sortOrder === "asc" ? sql`ASC` : sql`DESC`;

    const results = await db
      .select()
      .from(contactSubmissions)
      .where(whereClause)
      .orderBy(orderColumn, orderFn)
      .limit(limit)
      .offset(offset);

    return { submissions: results, total };
  } catch (error) {
    console.error("[Database] Failed to get contact submissions:", error);
    return { submissions: [], total: 0 };
  }
}

/**
 * Obtiene una submission de contacto por ID
 */
export async function getContactSubmissionById(
  id: number
): Promise<ContactSubmission | null> {
  if (!id) {
    throw new Error("[Database] Submission ID is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get submission: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(contactSubmissions)
      .where(eq(contactSubmissions.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[Database] Failed to get contact submission ${id}:`, error);
    throw error;
  }
}

/**
 * Actualiza una submission de contacto
 */
export async function updateContactSubmission(
  id: number,
  data: UpdateContactSubmission
): Promise<ContactSubmission | null> {
  if (!id) {
    throw new Error("[Database] Submission ID is required");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Database not available");
  }

  try {
    const { id: _id, createdAt, ...updateData } = data as any;

    await db
      .update(contactSubmissions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(contactSubmissions.id, id));

    return getContactSubmissionById(id);
  } catch (error) {
    console.error(`[Database] Failed to update contact submission ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina una submission de contacto (hard delete)
 */
export async function deleteContactSubmission(id: number): Promise<boolean> {
  if (!id) {
    throw new Error("[Database] Submission ID is required");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete submission: database not available");
    return false;
  }

  try {
    await db
      .delete(contactSubmissions)
      .where(eq(contactSubmissions.id, id));
    
    return true;
  } catch (error) {
    console.error(`[Database] Failed to delete contact submission ${id}:`, error);
    throw error;
  }
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Ejecuta una transacción con múltiples operaciones
 */
export async function withTransaction<T>(
  callback: (db: DbInstance) => Promise<T>
): Promise<T> {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Database not available");
  }

  try {
    return await db.transaction(async (tx) => {
      return await callback(tx as DbInstance);
    });
  } catch (error) {
    console.error("[Database] Transaction failed:", error);
    throw error;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  getDb,
  isDbAvailable,
  resetDbConnection,
  healthCheck,
  
  // Users
  upsertUser,
  getUserByOpenId,
  getUserByEmail,
  getUsers,
  updateUser,
  deleteUser,
  updateLastSignIn,
  
  // Contact submissions
  createContactSubmission,
  updateContactSubmissionStatus,
  getContactSubmissions,
  getContactSubmissionById,
  updateContactSubmission,
  deleteContactSubmission,
  
  // Transactions
  withTransaction,
};