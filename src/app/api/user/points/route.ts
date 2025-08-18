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

    // Buscar o usuário por email ou CPF
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { cpf: session.user.cpf }
        ]
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        points: true,
        organizationId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        points: user.points,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar pontos do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
