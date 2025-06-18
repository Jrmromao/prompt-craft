import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

const prismaDb = prismaClientSingleton();
export default prismaDb;
