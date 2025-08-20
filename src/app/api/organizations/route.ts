import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        cnpj: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Adicionar descrições baseadas no tipo de organização
    const organizationsWithDescription = organizations.map((org) => ({
      ...org,
      description: getOrganizationDescription(org.name, org.cnpj),
    }));

    return NextResponse.json(organizationsWithDescription);
  } catch (error) {
    console.error("Erro ao buscar organizações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

function getOrganizationDescription(name: string, cnpj: string): string {
  const nameLower = name.toLowerCase();

  // Detectar tipo de organização baseado no nome
  if (
    nameLower.includes("livraria") ||
    nameLower.includes("cultura") ||
    nameLower.includes("saraiva")
  ) {
    return "Livraria tradicional com amplo acervo de livros";
  }

  if (
    nameLower.includes("amazon") ||
    nameLower.includes("americanas") ||
    nameLower.includes("magazine")
  ) {
    return "E-commerce líder em vendas online";
  }

  if (nameLower.includes("casas") || nameLower.includes("bahia")) {
    return "Varejista especialista em móveis e eletrodomésticos";
  }

  if (nameLower.includes("loja") || nameLower.includes("varejo")) {
    return "Varejista com presença nacional";
  }

  // Descrição padrão para outras organizações
  return "Parceiro credenciado da NexPage";
}
