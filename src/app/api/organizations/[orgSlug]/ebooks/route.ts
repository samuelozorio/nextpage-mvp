import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ orgSlug: string }> }) {
  try {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'recentes';

    console.log('API Ebooks por Org - Parâmetros recebidos:', {
      orgSlug: resolvedParams.orgSlug,
      page,
      limit,
      category,
      search,
      sort,
    });

    // Verificar se a organização existe (apenas para validação do slug)
    const organization = await prisma.organization.findUnique({
      where: { slug: resolvedParams.orgSlug },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    // Construir filtros - mostrar todos os ebooks ativos, independentemente da organização
    const where: any = {
      isActive: true,
    };

    // Filtro por categoria
    if (category) {
      where.category = category;
    }

    // Filtro por busca (título ou autor)
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          author: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Construir ordenação
    let orderBy: any = {};
    switch (sort) {
      case 'recentes':
        orderBy.createdAt = 'desc';
        break;
      case 'antigos':
        orderBy.createdAt = 'asc';
        break;
      case 'titulo':
        orderBy.title = 'asc';
        break;
      case 'pontos':
        orderBy.pointsCost = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    console.log('API Ebooks por Org - Where clause:', where);

    // Buscar ebooks com paginação
    const [ebooks, total] = await Promise.all([
      prisma.ebook.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          author: true,
          category: true,
          coverImageUrl: true,
          description: true,
          pointsCost: true,
          isActive: true,
          createdAt: true,
          ebookFileUrl: true,
          organizationId: true,
        },
      }),
      prisma.ebook.count({ where }),
    ]);

    console.log('API Ebooks por Org - Ebooks encontrados:', ebooks.length);
    console.log('API Ebooks por Org - Total:', total);

    const response = {
      ebooks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    console.log('API Ebooks por Org - Resposta final:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao buscar ebooks:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
