import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar organização por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true, ebooks: true }
        }
      }
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar organização
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, cnpj, slug, logoUrl, loginImageUrl, coverHeroUrl, isActive } = body;

    // Verificar se organização existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id: params.id }
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se CNPJ já existe (exceto na própria organização)
    if (cnpj && cnpj !== existingOrg.cnpj) {
      const existingCnpj = await prisma.organization.findFirst({
        where: { 
          cnpj,
          id: { not: params.id }
        }
      });

      if (existingCnpj) {
        return NextResponse.json(
          { error: 'CNPJ já cadastrado' },
          { status: 400 }
        );
      }
    }

    // Verificar se slug já existe (exceto na própria organização)
    if (slug && slug !== existingOrg.slug) {
      const existingSlug = await prisma.organization.findFirst({
        where: { 
          slug,
          id: { not: params.id }
        }
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug já existe' },
          { status: 400 }
        );
      }
    }

    // Atualizar organização
    const organization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name: name || existingOrg.name,
        cnpj: cnpj || existingOrg.cnpj,
        slug: slug || existingOrg.slug,
        logoUrl: logoUrl !== undefined ? logoUrl : existingOrg.logoUrl,
        loginImageUrl: loginImageUrl !== undefined ? loginImageUrl : existingOrg.loginImageUrl,
        coverHeroUrl: coverHeroUrl !== undefined ? coverHeroUrl : existingOrg.coverHeroUrl,
        isActive: isActive !== undefined ? isActive : existingOrg.isActive
      },
      include: {
        _count: {
          select: { users: true, ebooks: true }
        }
      }
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar organização
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se organização existe
    const existingOrg = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { users: true, ebooks: true }
        }
      }
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se tem usuários ou ebooks associados
    if (existingOrg._count.users > 0 || existingOrg._count.ebooks > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar uma organização que possui usuários ou ebooks associados',
          details: {
            users: existingOrg._count.users,
            ebooks: existingOrg._count.ebooks
          }
        },
        { status: 400 }
      );
    }

    // Deletar organização
    await prisma.organization.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Organização deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar organização:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
