import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para bypass das RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const fileName = formData.get('fileName') as string;

    if (!file || !bucket) {
      return NextResponse.json(
        { error: 'Arquivo e bucket são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar bucket
    const validBuckets = ['logos', 'login-images', 'cover-hero'];
    if (!validBuckets.includes(bucket)) {
      return NextResponse.json(
        { error: 'Bucket inválido' },
        { status: 400 }
      );
    }

    // Gerar nome único para o arquivo
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const finalFileName = fileName || `${timestamp}-${randomId}.${fileExtension}`;

    // Fazer upload usando service role key
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      return NextResponse.json(
        { error: `Erro no upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(finalFileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: finalFileName
    });

  } catch (error) {
    console.error('Erro na API de upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
