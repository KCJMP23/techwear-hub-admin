import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Export all the functions from site-config
export * from './site-functions';
export * from './utils';

// Export services
export const siteService = {
  findAll: async (params?: { limit?: number; offset?: number }) => {
    return prisma.site.findMany({
      take: params?.limit,
      skip: params?.offset
    });
  },
  create: async (data: any) => {
    return prisma.site.create({ data });
  }
};