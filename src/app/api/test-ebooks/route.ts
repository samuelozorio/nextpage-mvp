import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('API Test Ebooks - Iniciando...');
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    console.log('API Test Ebooks - organizationId:', organizationId);

    const where: any = {
      isActive: true,
    };

    if (organizationId) {
      where.organizationId = organizationId;
    }

    console.log('API Test Ebooks - Where clause:', where);

    const ebooks = await prisma.ebook.findMany({
      where,
      take: 10,
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
        organizationId: true,
      },
    });

    console.log('API Test Ebooks - Ebooks encontrados:', ebooks.length);

    return NextResponse.json({
      ebooks,
      total: ebooks.length,
    });
  } catch (error) {
    console.error('Erro ao buscar ebooks:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
