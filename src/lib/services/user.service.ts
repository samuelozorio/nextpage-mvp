import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export class UserService {
  // Buscar usuário por CPF
  async findByCpf(cpf: string) {
    return await prisma.user.findUnique({
      where: { cpf },
      include: {
        organization: true,
      },
    });
  }

  // Autenticar usuário (admin master)
  async authenticate(cpf: string, password: string) {
    // Formatar o CPF para corresponder ao formato do banco
    const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    const user = await this.findByCpf(formattedCpf);

    if (!user || !user.isActive) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  // Autenticar usuário por organização
  async authenticateByOrganization(cpf: string, password: string, organizationSlug: string) {
    // Formatar o CPF para corresponder ao formato do banco
    const formattedCpf = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    const user = await prisma.user.findFirst({
      where: {
        cpf: formattedCpf,
        isActive: true,
        organization: {
          slug: organizationSlug,
          isActive: true,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  // Download ebook (debitar pontos) - Permite downloads múltiplos
  async downloadEbook(userId: string, ebookId: string, organizationId: string, pointsCost = 1) {
    return await prisma.$transaction(async (tx) => {
      // Verificar se usuário tem pontos suficientes
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user || user.points < pointsCost) {
        throw new Error('Pontos insuficientes');
      }

      // Debitar pontos sempre
      await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            decrement: pointsCost,
          },
        },
      });

      // Sempre criar registro de resgate (permitir downloads múltiplos)
      await tx.redemption.create({
        data: {
          userId,
          ebookId,
          organizationId,
          pointsUsed: pointsCost,
        },
      });

      // Retornar sucesso
      return {
        success: true,
        message: 'Download realizado com sucesso',
        pointsUsed: pointsCost,
        newBalance: user.points - pointsCost,
      };
    });
  }
}
