import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log("🔍 Verificando usuário admin...");

    const adminUser = await prisma.user.findFirst({
      where: {
        role: "ADMIN_MASTER",
      },
      select: {
        id: true,
        cpf: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        firstAccess: true,
        points: true,
        createdAt: true,
      },
    });

    if (adminUser) {
      console.log("✅ Usuário admin encontrado:");
      console.log("   ID:", adminUser.id);
      console.log("   CPF:", adminUser.cpf);
      console.log("   Nome:", adminUser.fullName);
      console.log("   Email:", adminUser.email);
      console.log("   Role:", adminUser.role);
      console.log("   Ativo:", adminUser.isActive);
      console.log("   Primeiro Acesso:", adminUser.firstAccess);
      console.log("   Pontos:", adminUser.points);
      console.log("   Criado em:", adminUser.createdAt);
    } else {
      console.log("❌ Nenhum usuário admin encontrado");
    }
  } catch (error) {
    console.error("❌ Erro ao verificar usuário admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser();
