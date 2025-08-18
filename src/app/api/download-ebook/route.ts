import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { StorageService } from "@/lib/services/storage.service";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const storageService = new StorageService();

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { url, title, ebookId } = await request.json();

    if (!url && !ebookId) {
      return NextResponse.json(
        { error: "URL do arquivo ou ebookId é obrigatório" },
        { status: 400 }
      );
    }

    console.log("Tentando baixar arquivo:", { url, title, ebookId });

    let fileUrl = url;
    let fileName = "";

    // Se temos ebookId, tentar baixar diretamente do Supabase
    if (ebookId) {
      try {
        console.log("Baixando por ebookId:", ebookId);

        // Extrair o nome do arquivo da URL do Supabase
        if (url && url.includes("supabase.co")) {
          const urlParts = url.split("/");
          const storageIndex = urlParts.findIndex(
            (part: string) => part === "storage"
          );
          if (storageIndex !== -1 && urlParts[storageIndex + 4] === "public") {
            fileName = urlParts.slice(storageIndex + 6).join("/");
          } else {
            // Fallback: usar o último segmento da URL
            fileName = urlParts[urlParts.length - 1];
          }
        } else {
          // Se não temos URL ou não é do Supabase, usar o padrão antigo
          fileName = `${ebookId}.pdf`;
        }

        console.log("Nome do arquivo extraído:", fileName);

        // Gerar URL assinada para download
        fileUrl = await storageService.getSignedDownloadUrl(
          "ebooks",
          fileName,
          3600
        );

        console.log("URL assinada gerada:", fileUrl);
      } catch (error) {
        console.error("Erro ao gerar URL assinada:", error);
        return NextResponse.json(
          {
            error: `Erro ao gerar URL de download: ${error}`,
          },
          { status: 500 }
        );
      }
    }

    // Se a URL for do Supabase, fazer download direto
    if (fileUrl.includes("supabase.co")) {
      try {
        console.log("Detectada URL do Supabase");

        // Se temos uma URL assinada, usar ela diretamente
        if (fileUrl.includes("token=")) {
          console.log("Usando URL assinada do Supabase");

          const response = await fetch(fileUrl);

          if (!response.ok) {
            console.error(
              "Erro na resposta HTTP:",
              response.status,
              response.statusText
            );
            return NextResponse.json(
              {
                error: `Erro ao baixar arquivo: ${response.status} ${response.statusText}`,
              },
              { status: 500 }
            );
          }

          const blob = await response.blob();
          console.log("Download do Supabase bem-sucedido, tamanho:", blob.size);

          return new NextResponse(blob, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${
                title || "ebook"
              }.pdf"`,
            },
          });
        }

        // Fallback para extração de URL (método antigo)
        const urlParts = fileUrl.split("/");
        console.log("URL parts:", urlParts);

        let bucketName = "ebooks";
        let filePath = "";

        // Padrão 1: .../storage/v1/object/public/bucket/file
        const storageIndex = urlParts.findIndex(
          (part: string) => part === "storage"
        );
        if (storageIndex !== -1 && urlParts[storageIndex + 4] === "public") {
          bucketName = urlParts[storageIndex + 5];
          filePath = urlParts.slice(storageIndex + 6).join("/");
        } else {
          // Padrão 2: .../bucket/file (fallback)
          bucketName = urlParts[urlParts.length - 3] || "ebooks";
          filePath = urlParts.slice(-2).join("/");
        }

        console.log("Extraído:", { bucketName, filePath });

        // Fazer download do arquivo do Supabase
        const { data, error } = await supabase.storage
          .from(bucketName)
          .download(filePath);

        if (error) {
          console.error("Erro ao baixar do Supabase:", error);
          return NextResponse.json(
            {
              error: `Erro ao baixar arquivo do Supabase: ${error.message}`,
            },
            { status: 500 }
          );
        }

        console.log("Download do Supabase bem-sucedido, tamanho:", data.size);

        return new NextResponse(data, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${
              title || "ebook"
            }.pdf"`,
          },
        });
      } catch (error) {
        console.error("Erro ao processar download do Supabase:", error);
        return NextResponse.json(
          {
            error: `Erro ao processar download: ${error}`,
          },
          { status: 500 }
        );
      }
    }

    // Se não for URL do Supabase, tentar download direto
    try {
      console.log("Tentando download direto da URL:", fileUrl);

      const response = await fetch(fileUrl);

      if (!response.ok) {
        console.error(
          "Erro na resposta HTTP:",
          response.status,
          response.statusText
        );
        return NextResponse.json(
          {
            error: `Erro ao baixar arquivo: ${response.status} ${response.statusText}`,
          },
          { status: 500 }
        );
      }

      const blob = await response.blob();
      console.log("Download direto bem-sucedido, tamanho:", blob.size);

      return new NextResponse(blob, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${
            title || "ebook"
          }.pdf"`,
        },
      });
    } catch (error) {
      console.error("Erro ao fazer download direto:", error);
      return NextResponse.json(
        {
          error: `Erro ao fazer download: ${error}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral no download:", error);
    return NextResponse.json(
      {
        error: `Erro interno do servidor: ${error}`,
      },
      { status: 500 }
    );
  }
}
