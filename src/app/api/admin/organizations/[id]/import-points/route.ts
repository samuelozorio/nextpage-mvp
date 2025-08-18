import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PointsImportService } from "@/lib/services/points-import.service";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    console.log("🔍 Debug - Sessão:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      userId: session?.user?.id,
    });

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Sessão não encontrada" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN_MASTER") {
      return NextResponse.json(
        {
          error: `Acesso negado. Role necessário: ADMIN_MASTER, Role atual: ${session.user.role}`,
        },
        { status: 401 }
      );
    }

    const organizationId = params.id;

    // Verificar se a organização existe
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    // Processar o arquivo
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo é obrigatório" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const allowedExtensions = [".csv", ".xls", ".xlsx"];

    const fileExtension = file.name.toLowerCase().split(".").pop();
    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado. Use CSV ou Excel." },
        { status: 400 }
      );
    }

    // Processar a planilha
    const pointsImportService = new PointsImportService();
    const result = await pointsImportService.processSpreadsheet(
      file,
      organizationId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      result,
      message: `Importação concluída: ${result.successRecords} registros processados com sucesso, ${result.errorRecords} erros.`,
    });
  } catch (error) {
    console.error("Erro ao processar importação:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
