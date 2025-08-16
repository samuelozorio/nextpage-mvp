import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("🔍 Verificando se existe usuário admin...");

    // Verificar se já existe um usuário admin
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: "ADMIN_MASTER",
      },
    });

    if (existingAdmin) {
      console.log("✅ Usuário admin já existe:", existingAdmin.cpf);
      return;
    }

    console.log("📝 Criando usuário admin...");

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = await prisma.user.create({
      data: {
        cpf: "00000000000",
        fullName: "Administrador Master",
        email: "admin@nextpage.com",
        password: hashedPassword,
        role: "ADMIN_MASTER",
        isActive: true,
        firstAccess: false,
        points: 0,
      },
    });

    console.log("✅ Usuário admin criado com sucesso!");
    console.log("📋 Credenciais:");
    console.log("   CPF: 00000000000");
    console.log("   Senha: admin123");
    console.log("   ID:", adminUser.id);
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
