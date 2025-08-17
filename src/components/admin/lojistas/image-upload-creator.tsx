"use client";

import { useState, useRef } from "react";
import { Upload, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageUploadCreatorProps {
  imageType: "logo" | "loginImage" | "coverHero";
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  previewUrl: string | null;
}

export function ImageUploadCreator({
  imageType,
  onFileSelect,
  selectedFile,
  previewUrl,
}: ImageUploadCreatorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypeConfig = {
    logo: {
      label: "Logo",
      description: "Logo da organização",
      maxSize: 2 * 1024 * 1024, // 2MB
      acceptedTypes: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
      previewSize: "w-24 h-24",
    },
    loginImage: {
      label: "Imagem de Login",
      description: "Imagem de fundo da página de login",
      maxSize: 5 * 1024 * 1024, // 5MB
      acceptedTypes: ["image/png", "image/jpeg", "image/webp"],
      previewSize: "w-32 h-20",
    },
    coverHero: {
      label: "Imagem de Capa",
      description: "Imagem de fundo do hero section",
      maxSize: 5 * 1024 * 1024, // 5MB
      acceptedTypes: ["image/png", "image/jpeg", "image/webp"],
      previewSize: "w-32 h-20",
    },
  };

  const config = imageTypeConfig[imageType];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!config.acceptedTypes.includes(file.type)) {
      alert(
        `Tipo de arquivo não suportado. Por favor, selecione um arquivo ${config.acceptedTypes.join(
          ", "
        )}`
      );
      return;
    }

    // Validar tamanho
    if (file.size > config.maxSize) {
      alert(
        `Arquivo muito grande. O arquivo deve ter no máximo ${
          config.maxSize / (1024 * 1024)
        }MB`
      );
      return;
    }

    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{config.label}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        {previewUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{config.label}</DialogTitle>
                <DialogDescription>
                  Visualização da {config.label.toLowerCase()}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt={config.label}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Seleção de Arquivo */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={config.acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="border-[#283031] text-white hover:bg-[#161d1d]"
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo
          </Button>
          {selectedFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFile}
              className="border-[#283031] text-white hover:bg-[#161d1d]"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Preview do Arquivo Selecionado */}
        {previewUrl && selectedFile && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado:
            </p>
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className={`${config.previewSize} object-cover border border-[#283031] rounded`}
              />
              <Badge className="absolute -top-2 -right-2 bg-blue-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Selecionado
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </p>
          </div>
        )}

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Formatos aceitos: {config.acceptedTypes.join(", ")}</p>
          <p>Tamanho máximo: {config.maxSize / (1024 * 1024)}MB</p>
        </div>
      </div>
    </div>
  );
}
