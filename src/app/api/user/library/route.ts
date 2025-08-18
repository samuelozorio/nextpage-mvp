import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    // Buscar ebooks da biblioteca do usuário
    const redemptions = await prisma.redemption.findMany({
      where: {
        userId: user.id,
        ebook: {
          isActive: true,
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      include: {
        ebook: {
          select: {
            id: true,
            title: true,
            author: true,
            description: true,
            category: true,
            coverImageUrl: true,
            ebookFileUrl: true,
            pointsCost: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        redeemedAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Contar total de ebooks na biblioteca
    const total = await prisma.redemption.count({
      where: {
        userId: user.id,
        ebook: {
          isActive: true,
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      library: redemptions.map((redemption) => ({
        id: redemption.ebook.id,
        title: redemption.ebook.title,
        author: redemption.ebook.author,
        description: redemption.ebook.description,
        category: redemption.ebook.category,
        coverImageUrl: redemption.ebook.coverImageUrl,
        ebookFileUrl: redemption.ebook.ebookFileUrl,
        pointsCost: redemption.ebook.pointsCost,
        createdAt: redemption.ebook.createdAt,
        downloadedAt: redemption.redeemedAt,
        pointsUsed: redemption.pointsUsed,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar biblioteca do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
