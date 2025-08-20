import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkOrganization() {
  try {
    console.log("Verificando organização stilo-a...");

    const organization = await prisma.organization.findUnique({
      where: { slug: "stilo-a" },
    });

    if (organization) {
      console.log("✅ Organização encontrada:");
      console.log("ID:", organization.id);
      console.log("Nome:", organization.name);
      console.log("Slug:", organization.slug);
      console.log("Ativa:", organization.isActive);
      console.log("CNPJ:", organization.cnpj);
    } else {
      console.log("❌ Organização stilo-a não encontrada");

      // Listar todas as organizações para debug
      const allOrganizations = await prisma.organization.findMany({
        select: { id: true, name: true, slug: true, isActive: true },
      });

      console.log("\n📋 Organizações disponíveis:");
      allOrganizations.forEach((org) => {
        console.log(
          `- ${org.name} (${org.slug}) - ${org.isActive ? "Ativa" : "Inativa"}`
        );
      });
    }
  } catch (error) {
    console.error("Erro ao verificar organização:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrganization();
