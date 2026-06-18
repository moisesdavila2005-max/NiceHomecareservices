import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
  uniqueIndex,
  datetime,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export const UserRole = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ContactStatus = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
  SPAM: "spam",
  ARCHIVED: "archived",
} as const;

export type ContactStatus = (typeof ContactStatus)[keyof typeof ContactStatus];

export const LoginMethod = {
  MANUS: "manus",
  EMAIL: "email",
  GOOGLE: "google",
  GITHUB: "github",
} as const;

export type LoginMethod = (typeof LoginMethod)[keyof typeof LoginMethod];

// ============================================================================
// USERS TABLE
// ============================================================================

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable(
  "users",
  {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: int("id").autoincrement().primaryKey(),

    /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
    openId: varchar("openId", { length: 64 }).notNull().unique(),

    /** User's display name */
    name: varchar("name", { length: 255 }),

    /** User's email address (unique) */
    email: varchar("email", { length: 320 }).unique(),

    /** Method used for authentication */
    loginMethod: mysqlEnum("loginMethod", Object.values(LoginMethod) as [string, ...string[]]),

    /** User role for authorization */
    role: mysqlEnum("role", Object.values(UserRole) as [string, ...string[]])
      .default(UserRole.USER)
      .notNull(),

    /** Whether the user has verified their email */
    emailVerified: boolean("emailVerified").default(false).notNull(),

    /** Whether the user account is active */
    isActive: boolean("isActive").default(true).notNull(),

    /** User avatar URL */
    avatar: varchar("avatar", { length: 512 }),

    /** User preferences as JSON */
    preferences: json("preferences").$type<Record<string, unknown>>(),

    /** Last IP address used */
    lastIp: varchar("lastIp", { length: 45 }), // IPv6 max length

    /** User agent string from last login */
    lastUserAgent: text("lastUserAgent"),

    /** Timestamps */
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"), // Soft delete
  },
  (table) => ({
    // Índices para consultas frecuentes
    emailIdx: index("email_idx").on(table.email),
    openIdIdx: uniqueIndex("openId_idx").on(table.openId),
    roleIdx: index("role_idx").on(table.role),
    isActiveIdx: index("isActive_idx").on(table.isActive),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
    lastSignedInIdx: index("lastSignedIn_idx").on(table.lastSignedIn),
    // Índice compuesto para usuarios activos por rol
    activeRoleIdx: index("activeRole_idx").on(table.isActive, table.role),
  }),
);

// ============================================================================
// CONTACT SUBMISSIONS TABLE
// ============================================================================

/**
 * Contact form submissions table with enhanced tracking
 */
export const contactSubmissions = mysqlTable(
  "contactSubmissions",
  {
    id: int("id").autoincrement().primaryKey(),

    /** Sender's full name */
    name: varchar("name", { length: 255 }).notNull(),

    /** Sender's email address */
    email: varchar("email", { length: 320 }).notNull(),

    /** Sender's phone number (optional) */
    phone: varchar("phone", { length: 20 }),

    /** Subject of the message */
    subject: varchar("subject", { length: 255 }),

    /** Message content */
    message: text("message").notNull(),

    /** Current status of the submission */
    status: mysqlEnum("status", Object.values(ContactStatus) as [string, ...string[]])
      .default(ContactStatus.PENDING)
      .notNull(),

    /** Priority level for the message */
    priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium"),

    /** Whether the sender wants a reply */
    wantsReply: boolean("wantsReply").default(true),

    /** Internal notes for team members */
    notes: text("notes"),

    /** IP address of the sender */
    ipAddress: varchar("ipAddress", { length: 45 }),

    /** User agent of the sender */
    userAgent: text("userAgent"),

    /** Reference to the user if authenticated */
    userId: int("userId").references(() => users.id, {
      onDelete: "set null",
    }),

    /** When the submission was processed */
    processedAt: timestamp("processedAt"),

    /** Timestamps */
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    // Índices para búsquedas y filtros
    emailIdx: index("email_idx").on(table.email),
    statusIdx: index("status_idx").on(table.status),
    userIdIdx: index("userId_idx").on(table.userId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
    priorityIdx: index("priority_idx").on(table.priority),
    // Índice compuesto para consultas de estado por fecha
    statusCreatedIdx: index("statusCreated_idx").on(table.status, table.createdAt),
  }),
);

// ============================================================================
// TYPES
// ============================================================================

// Users
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpdateUser = Partial<Omit<InsertUser, "id" | "createdAt">>;

// Contact Submissions
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
export type UpdateContactSubmission = Partial<Omit<InsertContactSubmission, "id" | "createdAt">>;

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email("Invalid email format"),
  name: (schema) => schema.name.min(2, "Name must be at least 2 characters"),
  openId: (schema) => schema.openId.min(1, "OpenId is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export const updateUserSchema = insertUserSchema.partial();

// Contact submission schemas
export const insertContactSubmissionSchema = createInsertSchema(
  contactSubmissions,
  {
    email: (schema) => schema.email.email("Invalid email format"),
    name: (schema) => schema.name.min(2, "Name must be at least 2 characters"),
    message: (schema) => schema.message.min(10, "Message must be at least 10 characters"),
    phone: (schema) =>
      schema.phone
        .optional()
        .refine(
          (val) => !val || /^[+]?[\d\s-()]{7,20}$/.test(val),
          "Invalid phone number format",
        ),
    subject: (schema) => schema.subject.optional(),
  },
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  processedAt: true,
});

export const selectContactSubmissionSchema = createSelectSchema(contactSubmissions);

export const updateContactSubmissionSchema = insertContactSubmissionSchema.partial();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if a user is an admin or super admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
}

/**
 * Check if a user account is active
 */
export function isActiveUser(user: User | null): boolean {
  return user?.isActive === true && !user.deletedAt;
}

/**
 * Generate a default user object for new signups
 */
export function createDefaultUser(openId: string, email?: string): InsertUser {
  return {
    openId,
    email: email || null,
    name: null,
    loginMethod: LoginMethod.MANUS,
    role: UserRole.USER,
    emailVerified: false,
    isActive: true,
    avatar: null,
    preferences: null,
    lastIp: null,
    lastUserAgent: null,
  };
}