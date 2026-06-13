import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  console.log("Initializing PrismaClient with URL:", process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@'));
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
