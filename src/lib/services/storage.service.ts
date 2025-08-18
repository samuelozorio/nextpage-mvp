import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com service role para operações administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class StorageService {
  /**
   * Upload de logo de organização
   */
  async uploadLogo(file: File, organizationId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}-logo.${fileExt}`;

    const { data, error } = await supabase.storage.from('logos').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw new Error(`Erro ao fazer upload da logo: ${error.message}`);
    }

    // Retornar URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('logos').getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload de imagem de login
   */
  async uploadLoginImage(file: File, organizationId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${organizationId}-login.${fileExt}`;

    const { data, error } = await supabase.storage.from('login-images').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw new Error(`Erro ao fazer upload da imagem de login: ${error.message}`);
    }

    // Retornar URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('login-images').getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload de capa de ebook
   */
  async uploadEbookCover(file: File, ebookId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${ebookId}-cover.${fileExt}`;

    const { data, error } = await supabase.storage.from('ebook-covers').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw new Error(`Erro ao fazer upload da capa: ${error.message}`);
    }

    // Retornar URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from('ebook-covers').getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload de capa de ebook (Buffer) - para upload em lote
   */
  async uploadEbookCoverBuffer(buffer: Buffer, fileName: string, bucket: string = 'ebook-covers'): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'image/png', // Agora realmente PNG
    });

    if (error) {
      throw new Error(`Erro ao fazer upload da capa: ${error.message}`);
    }

    // Retornar URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload de arquivo de ebook
   */
  async uploadEbookFile(file: File, ebookId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${ebookId}.${fileExt}`;

    const { data, error } = await supabase.storage.from('ebooks').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw new Error(`Erro ao fazer upload do ebook: ${error.message}`);
    }

    // Retornar URL privada (para download autenticado)
    const {
      data: { publicUrl },
    } = supabase.storage.from('ebooks').getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload de arquivo de ebook (Buffer) - para upload em lote
   */
  async uploadEbookFileBuffer(buffer: Buffer, fileName: string, bucket: string = 'ebooks'): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: 'application/pdf',
    });

    if (error) {
      throw new Error(`Erro ao fazer upload do ebook: ${error.message}`);
    }

    // Retornar URL privada (para download autenticado)
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Upload de planilha de importação
   */
  async uploadSpreadsheet(file: File, importId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${importId}.${fileExt}`;

    const { data, error } = await supabase.storage.from('uploads').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      throw new Error(`Erro ao fazer upload da planilha: ${error.message}`);
    }

    // Retornar URL privada
    const {
      data: { publicUrl },
    } = supabase.storage.from('uploads').getPublicUrl(fileName);

    return publicUrl;
  }

  /**
   * Deletar arquivo
   */
  async deleteFile(bucket: string, fileName: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  /**
   * Gerar URL de download assinada para ebooks (privados)
   */
  async getSignedDownloadUrl(bucket: string, fileName: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fileName, expiresIn);

    if (error) {
      throw new Error(`Erro ao gerar URL assinada: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Listar arquivos de um bucket
   */
  async listFiles(bucket: string, folder?: string): Promise<string[]> {
    const { data, error } = await supabase.storage.from(bucket).list(folder || '');

    if (error) {
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }

    return data.map((file) => file.name);
  }
}
