'use client';

import { useState, useRef } from 'react';
import { Upload, X, Eye, Trash2, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ImageManagerProps {
  organizationId: string;
  imageType: 'logo' | 'loginImage' | 'coverHero';
  currentImageUrl?: string | null;
  organizationName: string;
  onImageUpdate: (imageUrl: string) => void;
}

export function ImageManager({ 
  organizationId, 
  imageType, 
  currentImageUrl, 
  organizationName,
  onImageUpdate 
}: ImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageTypeConfig = {
    logo: {
      label: 'Logo',
      description: 'Logo da organização',
      bucket: 'logos',
      maxSize: 2 * 1024 * 1024, // 2MB
      acceptedTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
      previewSize: 'w-24 h-24',
    },
    loginImage: {
      label: 'Imagem de Login',
      description: 'Imagem de fundo da página de login',
      bucket: 'login-images',
      maxSize: 5 * 1024 * 1024, // 5MB
      acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'],
      previewSize: 'w-32 h-20',
    },
    coverHero: {
      label: 'Imagem de Capa',
      description: 'Imagem de fundo do hero section',
      bucket: 'cover-hero',
      maxSize: 5 * 1024 * 1024, // 5MB
      acceptedTypes: ['image/png', 'image/jpeg', 'image/webp'],
      previewSize: 'w-32 h-20',
    },
  };

  const config = imageTypeConfig[imageType];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!config.acceptedTypes.includes(file.type)) {
      alert(`Tipo de arquivo não suportado. Por favor, selecione um arquivo ${config.acceptedTypes.join(', ')}`);
      return;
    }

    // Validar tamanho
    if (file.size > config.maxSize) {
      alert(`Arquivo muito grande. O arquivo deve ter no máximo ${config.maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('imageType', imageType);

      const response = await fetch(`/api/admin/organizations/${organizationId}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload da imagem');
      }

      const result = await response.json();

      if (result.success) {
        onImageUpdate(result.imageUrl);
        alert(`${config.label} atualizada com sucesso!`);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert(`Erro no upload: ${error instanceof Error ? error.message : 'Erro interno do servidor'}`);
    } finally {
      setIsUploading(false);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    if (!confirm(`Tem certeza que deseja remover a ${config.label.toLowerCase()}?`)) {
      return;
    }

    try {
      // Aqui você pode implementar a remoção da imagem se necessário
      // Por enquanto, apenas limpa a URL
      onImageUpdate('');
      alert(`${config.label} removida com sucesso!`);
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      alert('Erro ao remover imagem');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{config.label}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
        {currentImageUrl && (
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{config.label} - {organizationName}</DialogTitle>
                  <DialogDescription>
                    Visualização da {config.label.toLowerCase()}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center">
                  <img
                    src={currentImageUrl}
                    alt={config.label}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveImage}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Imagem Atual */}
      {currentImageUrl && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Imagem atual:</p>
          <div className="relative inline-block">
            <img
              src={currentImageUrl}
              alt={config.label}
              className={`${config.previewSize} object-cover border border-[#283031] rounded`}
            />
            <Badge className="absolute -top-2 -right-2 bg-green-600">
              <Check className="h-3 w-3 mr-1" />
              Ativa
            </Badge>
          </div>
        </div>
      )}

      {/* Upload de Nova Imagem */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={config.acceptedTypes.join(',')}
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
          {previewUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewUrl(null)}
              className="border-[#283031] text-white hover:bg-[#161d1d]"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Preview da Nova Imagem */}
        {previewUrl && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preview da nova imagem:</p>
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className={`${config.previewSize} object-cover border border-[#283031] rounded`}
              />
              <Badge className="absolute -top-2 -right-2 bg-blue-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Nova
              </Badge>
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </>
              )}
            </Button>
          </div>
        )}

        {/* Informações */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Formatos aceitos: {config.acceptedTypes.join(', ')}</p>
          <p>Tamanho máximo: {config.maxSize / (1024 * 1024)}MB</p>
        </div>
      </div>
    </div>
  );
}
