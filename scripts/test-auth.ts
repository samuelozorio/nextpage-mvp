import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log("🔍 Testando autenticação do admin...");

    const adminUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN_MASTER",
      },
    });

    if (!adminUser) {
      console.log("❌ Usuário admin não encontrado");
      return;
    }

    console.log("📋 Usuário encontrado:", adminUser.cpf);

    // Testar algumas senhas comuns
    const testPasswords = [
      "admin123",
      "123456",
      "password",
      "admin",
      "stilo123",
      "stilo-a",
      "nextpage",
      "nextpage123",
    ];

    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, adminUser.password);
      if (isValid) {
        console.log("✅ Senha encontrada:", password);
        return;
      }
    }

    console.log("❌ Nenhuma das senhas testadas funcionou");
    console.log("💡 Tente usar a senha original do banco de dados");
  } catch (error) {
    console.error("❌ Erro ao testar autenticação:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
