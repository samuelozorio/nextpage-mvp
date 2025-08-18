import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Remover senha do response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { email, name, password, points, isActive, organizationId } = body;

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (email !== undefined) {
      // Verificar se o email já existe (se for diferente do atual)
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });
        if (emailExists) {
          return NextResponse.json(
            { error: "Email já cadastrado" },
            { status: 400 }
          );
        }
      }
      updateData.email = email;
    }

    if (name !== undefined) updateData.fullName = name;
    if (points !== undefined) updateData.points = points;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (organizationId !== undefined)
      updateData.organizationId = organizationId;

    // Hash da nova senha se fornecida
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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

    // Remover senha do response
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar usuário (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Soft delete - apenas desativar
    await prisma.user.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "Usuário deletado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
