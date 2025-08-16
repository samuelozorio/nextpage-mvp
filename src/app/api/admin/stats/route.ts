import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Buscar estatísticas do banco de dados
    const [
      totalOrganizations,
      activeOrganizations,
      totalUsers,
      totalEbooks,
      activeEbooks,
      totalDownloads,
      recentOrganizations,
    ] = await Promise.all([
      // Total de organizações
      prisma.organization.count(),
      
      // Organizações ativas
      prisma.organization.count({
        where: { isActive: true }
      }),
      
      // Total de usuários
      prisma.user.count({
        where: { isActive: true }
      }),
      
      // Total de ebooks
      prisma.ebook.count(),
      
      // Ebooks ativos
      prisma.ebook.count({
        where: { isActive: true }
      }),
      
      // Total de downloads (redemptions)
      prisma.redemption.count(),
      
      // Organizações recentes (últimas 5)
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          _count: {
            select: { users: true }
          }
        }
      })
    ]);

    // Calcular médias
    const avgUsersPerOrg = totalOrganizations > 0 ? Math.round(totalUsers / totalOrganizations) : 0;
    const avgPointsPerEbook = totalEbooks > 0 ? 80 : 0; // Mock por enquanto

    // Buscar downloads dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDownloads = await prisma.redemption.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Buscar novos usuários dos últimos 30 dias
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        },
        isActive: true
      }
    });

    // Buscar novos ebooks dos últimos 30 dias
    const recentEbooks = await prisma.ebook.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Buscar novas organizações dos últimos 30 dias
    const recentOrganizationsCount = await prisma.organization.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    const stats = {
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
        recent: recentOrganizationsCount,
        percentage: totalOrganizations > 0 ? Math.round((activeOrganizations / totalOrganizations) * 100) : 0
      },
      users: {
        total: totalUsers,
        recent: recentUsers,
        avgPerOrg: avgUsersPerOrg
      },
      ebooks: {
        total: totalEbooks,
        active: activeEbooks,
        recent: recentEbooks,
        percentage: totalEbooks > 0 ? Math.round((activeEbooks / totalEbooks) * 100) : 0,
        avgPoints: avgPointsPerEbook
      },
      downloads: {
        total: totalDownloads,
        recent: recentDownloads
      },
      recentOrganizations: recentOrganizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        usersCount: org._count.users,
        createdAt: org.createdAt
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
