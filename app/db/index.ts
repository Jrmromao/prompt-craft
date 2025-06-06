import { PrismaClient } from '@prisma/client';

declare global {
  var prismaClient: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [],
  });
};

const prisma = global.prismaClient ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

export { prisma };
