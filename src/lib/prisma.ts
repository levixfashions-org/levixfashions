// Singleton pattern preventing multiple PrismaClient instances during HMR
declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

// In Next.js / Node runtime, instantiate PrismaClient
let prismaInstance: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  if (process.env.NODE_ENV === 'production') {
    prismaInstance = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['warn', 'error'],
      });
    }
    prismaInstance = global.prisma;
  }
} catch {
  // Fallback mock when Prisma Client is not yet generated during lightweight unit testing
  prismaInstance = global.prisma || {};
}

export const prisma = prismaInstance;
export default prisma;
