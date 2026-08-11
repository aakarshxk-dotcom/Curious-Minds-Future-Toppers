import path from 'path'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Resolve the SQLite database to an absolute path. Relative "file:./..." URLs
// break in the standalone build (the generated client resolves them against a
// different directory), so we compute a stable absolute path from the working
// directory instead. Absolute "file:/..." URLs and non-file URLs (e.g. Postgres)
// are passed through as-is.
function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL
  if (envUrl && (!envUrl.startsWith('file:') || envUrl.startsWith('file:/'))) {
    return envUrl
  }
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/')
  return `file:${dbPath}`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
