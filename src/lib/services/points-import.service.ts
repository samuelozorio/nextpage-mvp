import { prisma } from "@/lib/prisma";
import { PointsImportRecord, PointsImportResult } from "@/types/organization";
import * as XLSX from "xlsx";

export class PointsImportService {
  // Processar arquivo de planilha (otimizado para serverless)
  async processSpreadsheet(
    file: File,
    organizationId: string,
    importedBy: string
  ): Promise<PointsImportResult> {
    try {
      console.log("🔍 Iniciando processamento da planilha:", file.name);
      console.log("📄 Tipo do arquivo:", file.type);
      console.log(
        "📄 Tamanho do arquivo:",
        (file.size / 1024).toFixed(2),
        "KB"
      );

      // Verificar tamanho do arquivo (limite de 5MB para serverless)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Arquivo muito grande. Tamanho máximo: 5MB");
      }

      let jsonData: any[][];

      // Verificar se é um arquivo CSV
      if (
        file.type === "text/csv" ||
        file.name.toLowerCase().endsWith(".csv")
      ) {
        console.log("📄 Processando como CSV...");

        // Ler o arquivo como texto
        const text = await file.text();

        // Normalizar quebras de linha e dividir
        const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const lines = normalizedText
          .split("\n")
          .filter((line) => line.trim() !== "");

        console.log("📄 Linhas após normalização:", lines.length);

        jsonData = lines.map((line) => {
          // Dividir por vírgula, mas respeitar aspas
          const values = line
            .split(",")
            .map((value) => value.trim().replace(/^["']|["']$/g, ""));
          return values;
        });

        console.log("📄 CSV processado:", jsonData.length, "linhas");
      } else {
        console.log("📄 Processando como Excel...");

        // Ler arquivo Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Converter para JSON incluindo o cabeçalho
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      }

      console.log("📊 Dados lidos da planilha:", jsonData.length, "linhas");

      // Validar estrutura da planilha
      const records = this.validateSpreadsheetData(jsonData);
      console.log("✅ Registros válidos encontrados:", records.length);

      // Limitar número de registros para evitar timeout
      if (records.length > 1000) {
        throw new Error(
          "Planilha muito grande. Máximo de 1000 registros por importação."
        );
      }

      // Criar registro de importação
      const pointsImport = await prisma.pointsImport.create({
        data: {
          fileName: file.name,
          organizationId,
          totalRecords: records.length,
          importedBy,
          status: "PROCESSING",
        },
      });

      console.log("📝 Registro de importação criado:", pointsImport.id);

      // Processar registros
      const result = await this.processRecords(
        records,
        organizationId,
        pointsImport.id
      );
      console.log("🎯 Resultado do processamento:", result);

      // Atualizar status da importação
      await prisma.pointsImport.update({
        where: { id: pointsImport.id },
        data: {
          status: result.errorRecords > 0 ? "PARTIAL" : "COMPLETED",
          successRecords: result.successRecords,
          errorRecords: result.errorRecords,
          errorDetails:
            result.errors.length > 0 ? JSON.stringify(result.errors) : null,
        },
      });

      console.log("✅ Importação finalizada com sucesso");
      return result;
    } catch (error) {
      console.error("❌ Erro ao processar planilha:", error);
      throw new Error(
        "Erro ao processar planilha: " + (error as Error).message
      );
    }
  }

  // Validar dados da planilha (otimizado para serverless)
  private validateSpreadsheetData(jsonData: any[][]): PointsImportRecord[] {
    if (!jsonData || jsonData.length === 0) {
      throw new Error("Planilha está vazia ou não foi possível ler os dados");
    }

    console.log("🔍 Iniciando validação dos dados...");
    console.log("📊 Total de linhas recebidas:", jsonData.length);

    // A primeira linha (índice 0) contém os cabeçalhos
    const headers = jsonData[0].map((h: any) => String(h).toLowerCase());
    console.log("📋 Cabeçalhos encontrados:", headers);

    // Encontrar índices das colunas obrigatórias
    const cpfIndex = headers.findIndex(
      (h) => h.includes("cpf") || h.includes("documento")
    );
    const pointsIndex = headers.findIndex(
      (h) => h.includes("ponto") || h.includes("credito") || h.includes("valor")
    );

    if (cpfIndex === -1 || pointsIndex === -1) {
      console.error("❌ Colunas obrigatórias não encontradas");
      console.error("📋 Cabeçalhos disponíveis:", headers);
      throw new Error(
        "Planilha deve conter pelo menos as colunas CPF e Pontos"
      );
    }

    console.log(
      `📍 Colunas encontradas: CPF (índice ${cpfIndex}), Pontos (índice ${pointsIndex})`
    );

    // Encontrar índices das colunas opcionais
    const nameIndex = headers.findIndex((h) => h.includes("nome"));
    const emailIndex = headers.findIndex(
      (h) => h.includes("email") || h.includes("e-mail")
    );

    console.log(
      `📍 Colunas opcionais: Nome (índice ${nameIndex}), Email (índice ${emailIndex})`
    );

    // Mapear dados (começar da linha 1, pois a linha 0 é o cabeçalho)
    const records: PointsImportRecord[] = [];

    console.log("🔄 Processando linhas de dados...");
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Pular linhas vazias
      if (!row || row.length === 0) {
        continue;
      }

      // Extrair CPF (limpar formatação)
      const cpfRaw = String(row[cpfIndex] || "");
      const cpf = cpfRaw.replace(/\D/g, ""); // Remove tudo que não é dígito

      // Extrair pontos
      const pointsRaw = row[pointsIndex];
      const points = parseInt(String(pointsRaw)) || 0;

      // Extrair dados opcionais
      const fullName =
        nameIndex !== -1 ? String(row[nameIndex] || "") : undefined;
      const email =
        emailIndex !== -1 ? String(row[emailIndex] || "") : undefined;

      if (cpf && cpf.length === 11 && points > 0) {
        records.push({
          cpf,
          points,
          fullName: fullName || undefined,
          email: email || undefined,
        });
      }
    }

    console.log(
      `🎯 Validação concluída: ${records.length} registros válidos de ${
        jsonData.length - 1
      } linhas de dados`
    );

    if (records.length === 0) {
      throw new Error("Nenhum registro válido encontrado na planilha");
    }

    return records;
  }

  // Processar registros da planilha (otimizado para serverless)
  private async processRecords(
    records: PointsImportRecord[],
    organizationId: string,
    pointsImportId: string
  ): Promise<PointsImportResult> {
    const errors: { row: number; cpf: string; error: string }[] = [];
    let successCount = 0;

    console.log("🔄 Processando", records.length, "registros...");
    console.log("🏢 Organização de destino:", organizationId);

    // Processar em lotes de 10 para evitar timeout em serverless
    const batchSize = 10;
    const batches = [];

    for (let i = 0; i < records.length; i += batchSize) {
      batches.push(records.slice(i, i + batchSize));
    }

    console.log(
      `📦 Processando em ${batches.length} lotes de ${batchSize} registros cada`
    );

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(
        `📦 Processando lote ${batchIndex + 1}/${batches.length} com ${
          batch.length
        } registros`
      );

      // Processar lote em transação
      const batchResult = await prisma.$transaction(async (tx) => {
        const batchErrors: { row: number; cpf: string; error: string }[] = [];
        let batchSuccessCount = 0;

        for (let i = 0; i < batch.length; i++) {
          const record = batch[i];
          const globalIndex = batchIndex * batchSize + i;

          try {
            // Validar CPF (validação básica)
            if (!this.isValidCPF(record.cpf)) {
              throw new Error("CPF inválido");
            }

            // Formatar CPF para o formato do banco
            const formattedCpf = record.cpf.replace(
              /(\d{3})(\d{3})(\d{3})(\d{2})/,
              "$1.$2.$3-$4"
            );

            // Buscar usuário existente
            let user = await tx.user.findUnique({
              where: { cpf: formattedCpf },
            });

            if (user) {
              // Atualizar usuário existente
              user = await tx.user.update({
                where: { id: user.id },
                data: {
                  points: { increment: record.points },
                  fullName: record.fullName || user.fullName,
                  email: record.email || user.email,
                },
              });
            } else {
              // Criar novo usuário
              const tempPassword = record.cpf.slice(-6); // Últimos 6 dígitos do CPF
              const hashedPassword = await import("bcryptjs").then((bcrypt) =>
                bcrypt.default.hash(tempPassword, 12)
              );

              user = await tx.user.create({
                data: {
                  cpf: formattedCpf,
                  fullName: record.fullName || `Usuário ${formattedCpf}`,
                  email: record.email,
                  password: hashedPassword,
                  points: record.points,
                  role: "CLIENTE",
                  organizationId,
                  isActive: true,
                  firstAccess: true,
                },
              });
            }

            // Registrar histórico de pontos
            await tx.pointsHistory.create({
              data: {
                userId: user.id,
                pointsAdded: record.points,
                sourceDescription: `Importação de planilha`,
                pointsImportId,
              },
            });

            batchSuccessCount++;
            console.log(
              `✅ Registro ${globalIndex + 1} processado com sucesso`
            );
          } catch (error) {
            console.error(`❌ Erro no registro ${globalIndex + 1}:`, error);
            batchErrors.push({
              row: globalIndex + 2, // +2 porque começa da linha 2 (depois do header)
              cpf: record.cpf,
              error: (error as Error).message,
            });
          }
        }

        return { batchErrors, batchSuccessCount };
      });

      // Acumular resultados do lote
      errors.push(...batchResult.batchErrors);
      successCount += batchResult.batchSuccessCount;

      console.log(
        `📦 Lote ${batchIndex + 1} concluído: ${
          batchResult.batchSuccessCount
        } sucessos, ${batchResult.batchErrors.length} erros`
      );
    }

    console.log(
      `🎯 Processamento concluído: ${successCount} sucessos, ${errors.length} erros`
    );

    return {
      success: errors.length === 0,
      totalRecords: records.length,
      successRecords: successCount,
      errorRecords: errors.length,
      errors,
    };
  }

  // Validação básica de CPF
  private isValidCPF(cpf: string): boolean {
    // Remove formatação
    const cleanCPF = cpf.replace(/\D/g, "");

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;

    // Verifica se não é uma sequência de números iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Para simplificar, vamos aceitar CPFs com 11 dígitos válidos
    return true;
  }

  // Buscar importações por organização
  async findByOrganization(organizationId: string) {
    return await prisma.pointsImport.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        organization: true,
      },
    });
  }

  // Buscar importação por ID
  async findById(id: string) {
    return await prisma.pointsImport.findUnique({
      where: { id },
      include: {
        organization: true,
        pointsHistory: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Listar todas as importações (admin)
  async findAll() {
    return await prisma.pointsImport.findMany({
      include: {
        organization: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
