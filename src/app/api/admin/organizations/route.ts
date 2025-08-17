import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar organizações com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cnpj: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Buscar organizações
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true, ebooks: true }
          }
        }
      }),
      prisma.organization.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova organização
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cnpj, slug, logoUrl, loginImageUrl, coverHeroUrl } = body;

    // Validações básicas
    if (!name || !cnpj || !slug) {
      return NextResponse.json(
        { error: 'Nome, CNPJ e slug são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await prisma.organization.findFirst({
      where: { cnpj }
    });

    if (existingCnpj) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se slug já existe
    const existingSlug = await prisma.organization.findFirst({
      where: { slug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug já existe' },
        { status: 400 }
      );
    }

    // Criar organização
    const organization = await prisma.organization.create({
      data: {
        name,
        cnpj,
        slug,
        logoUrl: logoUrl || null,
        loginImageUrl: loginImageUrl || null,
        coverHeroUrl: coverHeroUrl || null,
        isActive: true
      },
      include: {
        _count: {
          select: { users: true, ebooks: true }
        }
      }
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
