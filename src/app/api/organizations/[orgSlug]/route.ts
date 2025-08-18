import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { orgSlug } = resolvedParams;

    console.log("API Organization - Buscando organização com slug:", orgSlug);

    const organization = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: {
        ebooks: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            users: true,
            ebooks: true,
            redemptions: true,
          },
        },
      },
    });

    if (!organization) {
      console.log("API Organization - Organização não encontrada");
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    console.log("API Organization - Organização encontrada:", organization.name);
    return NextResponse.json(organization);
  } catch (error) {
    console.error("Erro ao buscar organização:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
