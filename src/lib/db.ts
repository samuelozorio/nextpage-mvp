import { PrismaClient } from '@prisma/client';

declare global {
  var __db: PrismaClient | undefined;
}

class DatabaseManager {
  private static instance: PrismaClient;
  private static isConnecting = false;
  private static connectionPromise: Promise<PrismaClient> | null = null;

  static getInstance(): PrismaClient {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
    }
    return DatabaseManager.instance;
  }

  static async connect(): Promise<PrismaClient> {
    if (DatabaseManager.connectionPromise) {
      return DatabaseManager.connectionPromise;
    }

    if (DatabaseManager.isConnecting) {
      // Aguardar conexão em andamento
      while (DatabaseManager.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return DatabaseManager.instance;
    }

    DatabaseManager.isConnecting = true;
    DatabaseManager.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        const prisma = DatabaseManager.getInstance();
        await prisma.$connect();
        console.log('✅ Conexão com banco estabelecida com sucesso');
        resolve(prisma);
      } catch (error) {
        console.error('❌ Erro ao conectar com banco:', error);
        reject(error);
      } finally {
        DatabaseManager.isConnecting = false;
        DatabaseManager.connectionPromise = null;
      }
    });

    return DatabaseManager.connectionPromise;
  }

  static async disconnect(): Promise<void> {
    if (DatabaseManager.instance) {
      await DatabaseManager.instance.$disconnect();
      DatabaseManager.instance = undefined as any;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const prisma = DatabaseManager.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }
}

// Para desenvolvimento, reutilizar a instância global
if (process.env.NODE_ENV !== 'production') {
  global.__db = DatabaseManager.getInstance();
}

export const db = DatabaseManager.getInstance();
export const connectDB = DatabaseManager.connect.bind(DatabaseManager);
export const disconnectDB = DatabaseManager.disconnect.bind(DatabaseManager);
export const healthCheck = DatabaseManager.healthCheck.bind(DatabaseManager);
