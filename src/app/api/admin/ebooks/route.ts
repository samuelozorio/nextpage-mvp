import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Listar ebooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    console.log("API Ebooks - Parâmetros recebidos:", {
      organizationId,
      page,
      limit,
      search,
    });

    const where: any = {
      isActive: true,
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    // Adicionar busca por título, autor ou categoria
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    console.log("API Ebooks - Where clause:", where);

    // Buscar total de registros para paginação
    const total = await prisma.ebook.count({ where });
    console.log("API Ebooks - Total de ebooks encontrados:", total);

    // Buscar ebooks com paginação
    const ebooks = await prisma.ebook.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    console.log("API Ebooks - Ebooks retornados:", ebooks.length);

    // Calcular informações de paginação
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      ebooks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };

    console.log("API Ebooks - Resposta final:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar ebooks:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar ebook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      author,
      description,
      category,
      coverImageUrl,
      ebookFileUrl,
      pointsCost = 1,
      organizationId,
    } = body;

    // Validações
    if (!title || !author) {
      return NextResponse.json(
        { error: "Título e autor são obrigatórios" },
        { status: 400 }
      );
    }

    const ebook = await prisma.ebook.create({
      data: {
        title,
        author,
        description,
        category,
        coverImageUrl,
        ebookFileUrl,
        pointsCost,
        isActive: true,
        organizationId: organizationId || null,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(ebook, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar ebook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
