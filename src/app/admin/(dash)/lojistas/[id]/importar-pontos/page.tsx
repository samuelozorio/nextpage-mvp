"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportarPontosPageProps {
  params: { id: string };
}

export default function ImportarPontosPage({
  params,
}: ImportarPontosPageProps) {
  const [organizationId, setOrganizationId] = useState<string>("");
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Carregar parâmetros
  useEffect(() => {
    setOrganizationId(params.id);
    setIsParamsLoaded(true);
  }, [params.id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `/api/admin/organizations/${organizationId}/import-points`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data.result);
        toast({
          title: "Sucesso!",
          description: data.message,
        });
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro ao processar arquivo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload do arquivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "CPF,Nome,Email,Pontos\n12345678901,João Silva,joao@email.com,100\n98765432100,Maria Santos,maria@email.com,50";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-importacao-pontos.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isParamsLoaded) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Importar Pontos</h1>
        <p className="text-muted-foreground mt-2">
          Faça upload de uma planilha CSV ou Excel para importar pontos dos
          usuários
        </p>
      </div>

      <div className="grid gap-6">
        {/* Card de Upload */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload de Planilha
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Selecione um arquivo CSV ou Excel com os dados dos usuários e seus
              pontos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">Arquivo</Label>
              <Input
                id="file"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="text-sm text-muted-foreground">
                Formatos aceitos: CSV, XLS, XLSX
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 bg-[#0f0f0f] rounded-lg border border-[#283031]">
                <p className="text-sm font-medium text-white">
                  Arquivo selecionado:
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar Pontos
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Baixar Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado do Upload */}
        {uploadResult && (
          <Card className="bg-[#1a1a1a] border-[#283031]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Resultado da Importação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#0f0f0f] rounded-lg border border-[#283031]">
                  <div className="text-2xl font-bold text-green-400">
                    {uploadResult.successRecords}
                  </div>
                  <div className="text-sm text-green-400">
                    Registros Processados
                  </div>
                </div>
                <div className="text-center p-4 bg-[#0f0f0f] rounded-lg border border-[#283031]">
                  <div className="text-2xl font-bold text-red-400">
                    {uploadResult.errorRecords}
                  </div>
                  <div className="text-sm text-red-400">Erros</div>
                </div>
                <div className="text-center p-4 bg-[#0f0f0f] rounded-lg border border-[#283031]">
                  <div className="text-2xl font-bold text-blue-400">
                    {uploadResult.totalRecords}
                  </div>
                  <div className="text-sm text-blue-400">
                    Total de Registros
                  </div>
                </div>
              </div>

              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-red-400 mb-2">
                    Erros encontrados:
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {uploadResult.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm text-red-400 p-2 bg-[#0f0f0f] rounded border border-[#283031]"
                      >
                        <strong>Linha {error.row}:</strong> {error.error} (CPF:{" "}
                        {error.cpf})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card className="bg-[#1a1a1a] border-[#283031]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instruções
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Formato da Planilha:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• A primeira linha deve conter os cabeçalhos</li>
                <li>• Colunas obrigatórias: CPF, Pontos</li>
                <li>• Colunas opcionais: Nome, Email</li>
                <li>• CPF deve ter 11 dígitos (apenas números)</li>
                <li>• Pontos deve ser um número maior que zero</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-white">Comportamento:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Usuários existentes terão seus pontos somados</li>
                <li>• Usuários novos serão criados automaticamente</li>
                <li>• Senha temporária será os últimos 6 dígitos do CPF</li>
                <li>
                  • Usuários novos terão primeiro acesso marcado como true
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
