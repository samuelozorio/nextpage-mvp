import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { cpf, password, organizationSlug } = await request.json();

    if (!cpf || !password || !organizationSlug) {
      return NextResponse.json(
        { error: "CPF, senha e organização são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a organização existe
    const organization = await prisma.organization.findUnique({
      where: { slug: organizationSlug, isActive: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada ou inativa" },
        { status: 404 }
      );
    }

    // Formatar CPF para corresponder ao formato do banco
    const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    // Buscar usuário
    const user = await prisma.user.findFirst({
      where: {
        cpf: formattedCpf,
        organizationId: organization.id,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se é primeiro acesso
    if (!user.firstAccess) {
      return NextResponse.json(
        { error: "Este usuário já possui senha definida" },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Atualizar senha e marcar como não é mais primeiro acesso
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        firstAccess: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Senha criada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
