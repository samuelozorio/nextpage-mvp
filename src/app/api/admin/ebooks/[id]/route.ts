import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Buscar ebook por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ebook = await prisma.ebook.findUnique({
      where: { id: params.id },
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
    });

    if (!ebook) {
      return NextResponse.json(
        { error: "Ebook não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(ebook);
  } catch (error) {
    console.error("Erro ao buscar ebook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar ebook
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const {
      title,
      author,
      description,
      category,
      coverImageUrl,
      ebookFileUrl,
      pointsCost,
      isActive,
      organizationId,
    } = body;

    // Verificar se o ebook existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { id: params.id },
    });

    if (!existingEbook) {
      return NextResponse.json(
        { error: "Ebook não encontrado" },
        { status: 404 }
      );
    }

    // Validações
    if (title !== undefined && !title) {
      return NextResponse.json(
        { error: "Título não pode ser vazio" },
        { status: 400 }
      );
    }

    if (author !== undefined && !author) {
      return NextResponse.json(
        { error: "Autor não pode ser vazio" },
        { status: 400 }
      );
    }

    const updatedEbook = await prisma.ebook.update({
      where: { id: params.id },
      data: {
        title,
        author,
        description,
        category,
        coverImageUrl,
        ebookFileUrl,
        pointsCost,
        isActive,
        organizationId,
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

    return NextResponse.json(updatedEbook);
  } catch (error) {
    console.error("Erro ao atualizar ebook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar ebook (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o ebook existe
    const existingEbook = await prisma.ebook.findUnique({
      where: { id: params.id },
    });

    if (!existingEbook) {
      return NextResponse.json(
        { error: "Ebook não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete - apenas desativar
    await prisma.ebook.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Ebook deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar ebook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
