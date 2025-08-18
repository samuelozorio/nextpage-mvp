import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import AdmZip from "adm-zip";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para bypass das RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para criar uma capa informativa baseada nos metadados do PDF
async function createInformativeCover(
  pdfBuffer: Buffer,
  filename: string
): Promise<Buffer> {
  try {
    // Carregar o PDF para extrair informações
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Extrair metadados do nome do arquivo
    const metadata = extractMetadataFromFilename(filename);

    // Criar canvas para a capa
    const { createCanvas } = require("canvas");
    const canvas = createCanvas(300, 400);
    const ctx = canvas.getContext("2d");

    // Fundo gradiente profissional
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#2C3E50");
    gradient.addColorStop(1, "#34495E");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 400);

    // Borda decorativa
    ctx.strokeStyle = "#ECF0F1";
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, 270, 370);

    // Ícone de PDF
    ctx.fillStyle = "#ECF0F1";
    ctx.fillRect(120, 80, 60, 80);
    ctx.fillRect(125, 75, 50, 10);
    ctx.fillRect(125, 165, 50, 10);

    // Título do ebook
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";

    // Quebrar título em múltiplas linhas
    const words = metadata.title.split(" ");
    let line = "";
    let y = 220;
    const maxWidth = 260;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 150, y);
        line = words[i] + " ";
        y += 22;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 150, y);

    // Autor
    ctx.font = "14px Arial";
    ctx.fillStyle = "#BDC3C7";
    ctx.fillText(`por ${metadata.author}`, 150, y + 25);

    // Informações do PDF
    ctx.font = "12px Arial";
    ctx.fillStyle = "#95A5A6";
    ctx.fillText(`${pageCount} página${pageCount > 1 ? "s" : ""}`, 150, y + 45);

    // Decoração inferior
    ctx.strokeStyle = "#ECF0F1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 350);
    ctx.lineTo(250, 350);
    ctx.stroke();

    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Erro ao criar capa informativa:", error);

    // Fallback: capa simples
    const { createCanvas } = require("canvas");
    const canvas = createCanvas(300, 400);
    const ctx = canvas.getContext("2d");

    // Fundo gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "#4A90E2");
    gradient.addColorStop(1, "#357ABD");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 400);

    // Texto
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PDF", 150, 180);

    ctx.font = "16px Arial";
    ctx.fillText("Document", 150, 210);

    // Ícone de documento
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(120, 100, 60, 80);
    ctx.beginPath();
    ctx.moveTo(120, 100);
    ctx.lineTo(140, 80);
    ctx.lineTo(160, 80);
    ctx.stroke();

    return canvas.toBuffer("image/png");
  }
}

// Função para extrair metadados do nome do arquivo
function extractMetadataFromFilename(filename: string): {
  title: string;
  author: string;
} {
  // Remove extensão
  const nameWithoutExt = filename.replace(/\.pdf$/i, "");

  // Tenta extrair título e autor do nome do arquivo
  // Formato esperado: "Título - Autor.pdf" ou "Título.pdf"
  const parts = nameWithoutExt.split(" - ");

  if (parts.length >= 2) {
    return {
      title: parts[0].trim(),
      author: parts[1].trim(),
    };
  } else {
    return {
      title: nameWithoutExt,
      author: "Autor Desconhecido",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo ZIP é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se é um arquivo ZIP
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json(
        { error: "Arquivo deve ser um ZIP" },
        { status: 400 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];

    try {
      // Ler o arquivo ZIP
      const zipBuffer = Buffer.from(await file.arrayBuffer());
      const zip = new AdmZip(zipBuffer);

      // Extrair todos os arquivos
      const zipEntries = zip.getEntries();

      // Filtrar apenas arquivos PDF
      const pdfEntries = zipEntries.filter((entry) =>
        entry.entryName.toLowerCase().endsWith(".pdf")
      );

      if (pdfEntries.length === 0) {
        return NextResponse.json(
          { error: "Nenhum arquivo PDF encontrado no ZIP" },
          { status: 400 }
        );
      }

      console.log(`Processando ${pdfEntries.length} arquivos PDF...`);

      // Processar cada PDF
      for (const entry of pdfEntries) {
        try {
          const pdfBuffer = entry.getData();
          const filename = entry.entryName.split("/").pop() || "unknown.pdf";

          console.log(`Processando: ${filename}`);

          // Extrair metadados do nome do arquivo
          const metadata = extractMetadataFromFilename(filename);

          // Criar capa informativa baseada nos metadados do PDF
          const coverImageBuffer = await createInformativeCover(
            pdfBuffer,
            filename
          );

          // Gerar nomes únicos para os arquivos
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);

          const pdfFileName = `${timestamp}-${randomId}-${filename}`;
          const coverFileName = `${timestamp}-${randomId}-cover.png`;

          // Upload do PDF para o bucket 'ebooks'
          const { error: pdfError } = await supabase.storage
            .from("ebooks")
            .upload(pdfFileName, pdfBuffer, {
              contentType: "application/pdf",
              cacheControl: "3600",
              upsert: false,
            });

          if (pdfError) {
            throw new Error(`Erro no upload do PDF: ${pdfError.message}`);
          }

          // Upload da capa para o bucket 'ebook-covers'
          const { error: coverError } = await supabase.storage
            .from("ebook-covers")
            .upload(coverFileName, coverImageBuffer, {
              contentType: "image/png",
              cacheControl: "3600",
              upsert: false,
            });

          if (coverError) {
            throw new Error(`Erro no upload da capa: ${coverError.message}`);
          }

          // Gerar URLs públicas
          const { data: pdfUrlData } = supabase.storage
            .from("ebooks")
            .getPublicUrl(pdfFileName);

          const { data: coverUrlData } = supabase.storage
            .from("ebook-covers")
            .getPublicUrl(coverFileName);

          // Criar registro no banco de dados
          const { PrismaClient } = require("@prisma/client");
          const prisma = new PrismaClient();

          await prisma.ebook.create({
            data: {
              title: metadata.title,
              author: metadata.author,
              description: `Ebook: ${metadata.title}`,
              coverImageUrl: coverUrlData.publicUrl,
              ebookFileUrl: pdfUrlData.publicUrl,
              pointsCost: 1,
              isActive: true,
              organizationId: organizationId || null,
            },
          });

          await prisma.$disconnect();

          console.log(`✅ ${filename} processado com sucesso`);
          successCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Erro desconhecido";
          console.error(
            `❌ Erro ao processar ${entry.entryName}:`,
            errorMessage
          );
          errors.push(`${entry.entryName}: ${errorMessage}`);
        }
      }

      return NextResponse.json({
        success: successCount,
        errors,
        message: `Processados ${successCount} ebooks com sucesso${
          errors.length > 0 ? `, ${errors.length} erros` : ""
        }`,
      });
    } catch (error) {
      console.error("Erro ao processar ZIP:", error);
      return NextResponse.json(
        { error: "Erro ao processar arquivo ZIP" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro na API de upload em lote:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
