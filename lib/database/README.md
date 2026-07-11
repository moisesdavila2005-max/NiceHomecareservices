# Database Layer

This directory contains all database-related code:

- `db.ts` - Database operations and queries
- `schema.ts` - Database schema definitions and types

## Structure

**db.ts** exports functions for:
- User operations (upsert, get, update, delete)
- Contact submissions (create, read, update, delete)
- Database health checks
- Transaction management

**schema.ts** defines:
- Database tables (users, contactSubmissions)
- Type definitions
- Zod validation schemas
- Utility functions for role checking
