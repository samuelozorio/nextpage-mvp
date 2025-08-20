import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Tratamento de erros de conexão
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma Client conectado com sucesso');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar Prisma Client:', error);
  });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
