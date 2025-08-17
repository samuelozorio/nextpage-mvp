import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para fazer upload de imagem para o bucket
export async function uploadImage(
  file: File,
  bucket: 'logos' | 'login-images' | 'cover-hero',
  fileName?: string
): Promise<{ url: string; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (fileName) {
      formData.append('fileName', fileName);
    }

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return { url: '', error: result.error || 'Erro no upload' };
    }

    return { url: result.url, error: null };
  } catch (error) {
    return { url: '', error: 'Erro ao fazer upload da imagem' };
  }
}

// Função para deletar imagem do bucket
export async function deleteImage(
  url: string,
  bucket: 'logos' | 'login-images' | 'cover-hero'
): Promise<{ error: string | null }> {
  try {
    // Extrair o nome do arquivo da URL
    const fileName = url.split('/').pop();
    if (!fileName) {
      return { error: 'Nome do arquivo não encontrado na URL' };
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    return { error: error?.message || null };
  } catch (error) {
    return { error: 'Erro ao deletar imagem' };
  }
}
