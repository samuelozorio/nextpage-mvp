import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrganizationService } from "@/lib/services/organization.service";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const organizationId = resolvedParams.id;

    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o usuário é admin master
    if (session.user.role !== "ADMIN_MASTER") {
      return NextResponse.json(
        { success: false, error: "Acesso negado" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo fornecido" },
        { status: 400 }
      );
    }

    if (
      !imageType ||
      !["logo", "loginImage", "coverHero"].includes(imageType)
    ) {
      return NextResponse.json(
        { success: false, error: "Tipo de imagem inválido" },
        { status: 400 }
      );
    }

    // Validar organização
    const organizationService = new OrganizationService();
    const organization = await organizationService.findById(organizationId);

    if (!organization) {
      return NextResponse.json(
        { success: false, error: "Organização não encontrada" },
        { status: 404 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (imageType === "logo") {
      allowedTypes.push("image/svg+xml");
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipo de arquivo não suportado" },
        { status: 400 }
      );
    }

    // Validar tamanho (15MB para login e cover, 2MB para logo)
    const maxSize = imageType === "logo" ? 2 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        {
          success: false,
          error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
        },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileName = `${organizationId}-${imageType}-${timestamp}-${randomId}.${fileExtension}`;

    // Determinar bucket baseado no tipo de imagem
    let bucketName: string;
    switch (imageType) {
      case "logo":
        bucketName = "logos";
        break;
      case "loginImage":
        bucketName = "login-images";
        break;
      case "coverHero":
        bucketName = "cover-hero";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Tipo de imagem inválido" },
          { status: 400 }
        );
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Fazer upload para o Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erro no upload para Supabase:", uploadError);
      return NextResponse.json(
        { success: false, error: "Erro ao fazer upload da imagem" },
        { status: 500 }
      );
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    // Atualizar organização no banco de dados
    const updateData: any = {};
    switch (imageType) {
      case "logo":
        updateData.logoUrl = imageUrl;
        break;
      case "loginImage":
        updateData.loginImageUrl = imageUrl;
        break;
      case "coverHero":
        updateData.coverHeroUrl = imageUrl;
        break;
    }

    const updatedOrganization = await organizationService.update({
      id: organizationId,
      ...updateData,
    });

    return NextResponse.json({
      success: true,
      imageUrl,
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
