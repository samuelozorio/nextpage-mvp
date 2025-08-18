import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1. Criar organização
  console.log("📝 Criando organização...");
  const organization = await prisma.organization.create({
    data: {
      name: "Stilo A",
      cnpj: "12.345.678/0001-90",
      slug: "stilo-a",
      isActive: true,
    },
  });
  console.log("✅ Organização criada:", organization.name);

  // 2. Criar usuário admin master
  console.log("👑 Criando usuário admin master...");
  const adminPassword = await bcrypt.hash("admin123", 12);
  const adminMaster = await prisma.user.create({
    data: {
      cpf: "123.456.789-00",
      email: "admin@stiloa.com",
      fullName: "Administrador Master",
      password: adminPassword,
      points: 1000,
      role: "ADMIN_MASTER",
      isActive: true,
      firstAccess: false,
    },
  });
  console.log("✅ Admin master criado:", adminMaster.fullName);

  // 3. Criar usuário cliente da organização
  console.log("👤 Criando usuário cliente...");
  const clientPassword = await bcrypt.hash("cliente123", 12);
  const client = await prisma.user.create({
    data: {
      cpf: "987.654.321-00",
      email: "cliente@stiloa.com",
      fullName: "João Silva",
      password: clientPassword,
      points: 50,
      role: "CLIENTE",
      organizationId: organization.id,
      isActive: true,
      firstAccess: false,
    },
  });
  console.log("✅ Cliente criado:", client.fullName);

  // 4. Criar alguns ebooks de exemplo
  console.log("📚 Criando ebooks de exemplo...");
  const ebooks = await Promise.all([
    prisma.ebook.create({
      data: {
        title: "Armadilhas da Mente",
        author: "Augusto Cury",
        description:
          "Um livro sobre como identificar e superar as armadilhas mentais que nos impedem de viver plenamente.",
        category: "Desenvolvimento Pessoal",
        coverImageUrl:
          "https://via.placeholder.com/300x400/2C3E50/FFFFFF?text=Armadilhas+da+Mente",
        ebookFileUrl:
          "https://via.placeholder.com/300x400/34495E/FFFFFF?text=PDF+Sample",
        pointsCost: 1,
        isActive: true,
        organizationId: organization.id,
      },
    }),
    prisma.ebook.create({
      data: {
        title: "O Poder do Hábito",
        author: "Charles Duhigg",
        description:
          "Por que fazemos o que fazemos na vida e nos negócios. Um guia para transformar hábitos.",
        category: "Desenvolvimento Pessoal",
        coverImageUrl:
          "https://via.placeholder.com/300x400/27AE60/FFFFFF?text=O+Poder+do+Habito",
        ebookFileUrl:
          "https://via.placeholder.com/300x400/2ECC71/FFFFFF?text=PDF+Sample",
        pointsCost: 2,
        isActive: true,
        organizationId: organization.id,
      },
    }),
    prisma.ebook.create({
      data: {
        title: "Mindset: A Nova Psicologia do Sucesso",
        author: "Carol S. Dweck",
        description:
          "Como podemos aprender a cumprir nosso potencial através da mentalidade de crescimento.",
        category: "Psicologia",
        coverImageUrl:
          "https://via.placeholder.com/300x400/E74C3C/FFFFFF?text=Mindset",
        ebookFileUrl:
          "https://via.placeholder.com/300x400/EC7063/FFFFFF?text=PDF+Sample",
        pointsCost: 1,
        isActive: true,
        organizationId: organization.id,
      },
    }),
    prisma.ebook.create({
      data: {
        title: "A Única Coisa",
        author: "Gary Keller",
        description:
          "A verdade surpreendentemente simples por trás de resultados extraordinários.",
        category: "Produtividade",
        coverImageUrl:
          "https://via.placeholder.com/300x400/9B59B6/FFFFFF?text=A+Unica+Coisa",
        ebookFileUrl:
          "https://via.placeholder.com/300x400/BB8FCE/FFFFFF?text=PDF+Sample",
        pointsCost: 1,
        isActive: true,
        organizationId: organization.id,
      },
    }),
    prisma.ebook.create({
      data: {
        title: "Como Fazer Amigos e Influenciar Pessoas",
        author: "Dale Carnegie",
        description:
          "Técnicas comprovadas para melhorar suas relações pessoais e profissionais.",
        category: "Relacionamentos",
        coverImageUrl:
          "https://via.placeholder.com/300x400/F39C12/FFFFFF?text=Como+Fazer+Amigos",
        ebookFileUrl:
          "https://via.placeholder.com/300x400/F7DC6F/FFFFFF?text=PDF+Sample",
        pointsCost: 2,
        isActive: true,
        organizationId: organization.id,
      },
    }),
  ]);

  console.log("✅ Ebooks criados:", ebooks.length);

  // 5. Criar alguns downloads de exemplo para o cliente
  console.log("📥 Criando downloads de exemplo...");
  const downloads = await Promise.all([
    prisma.redemption.create({
      data: {
        userId: client.id,
        ebookId: ebooks[0].id,
        organizationId: organization.id,
        pointsUsed: ebooks[0].pointsCost,
        redeemedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      },
    }),
    prisma.redemption.create({
      data: {
        userId: client.id,
        ebookId: ebooks[1].id,
        organizationId: organization.id,
        pointsUsed: ebooks[1].pointsCost,
        redeemedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
      },
    }),
  ]);

  console.log("✅ Downloads de exemplo criados:", downloads.length);

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📋 Resumo dos dados criados:");
  console.log(`   • Organização: ${organization.name} (${organization.slug})`);
  console.log(
    `   • Admin Master: ${adminMaster.fullName} (${adminMaster.email})`
  );
  console.log(`   • Cliente: ${client.fullName} (${client.email})`);
  console.log(`   • Ebooks: ${ebooks.length} títulos`);
  console.log(`   • Downloads: ${downloads.length} registros`);

  console.log("\n🔑 Credenciais de acesso:");
  console.log("   Admin Master:");
  console.log(`     Email: ${adminMaster.email}`);
  console.log("     Senha: admin123");
  console.log("   Cliente:");
  console.log(`     Email: ${client.email}`);
  console.log("     Senha: cliente123");
  console.log(`     CPF: ${client.cpf}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
