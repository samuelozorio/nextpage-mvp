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

  // Criar ou atualizar usuário durante importação de planilha
  async createOrUpdateFromImport(data: {
    cpf: string;
    points: number;
    fullName?: string;
    email?: string;
    organizationId: string;
    pointsImportId: string;
  }) {
    const { cpf, points, fullName, email, organizationId, pointsImportId } = data;

    console.log(`👤 Processando usuário CPF ${cpf} com ${points} pontos`);

    return await prisma.$transaction(async (tx) => {
      // Verificar se usuário já existe
      let user = await tx.user.findUnique({
        where: { cpf },
      });

      if (user) {
        console.log(`🔄 Atualizando usuário existente: ${user.fullName || user.cpf}`);
        console.log(`🏢 Organização atual: ${user.organizationId}, Nova organização: ${organizationId}`);

        // Verificar se o usuário já pertence a uma organização diferente
        if (user.organizationId && user.organizationId !== organizationId) {
          console.log(
            `⚠️ ATENÇÃO: Usuário ${user.cpf} já pertence à organização ${user.organizationId}, mas está sendo importado para ${organizationId}`,
          );
        }

        // Atualizar usuário existente
        user = await tx.user.update({
          where: { cpf },
          data: {
            points: {
              increment: points,
            },
            // Atualizar dados se fornecidos e não existirem
            ...(fullName && !user.fullName && { fullName }),
            ...(email && !user.email && { email }),
            // Associar à organização se não estiver associado
            ...(user.organizationId === null && { organizationId }),
          },
        });
        console.log(`✅ Usuário atualizado. Novos pontos: ${user.points}, Organização: ${user.organizationId}`);
      } else {
        console.log(`🆕 Criando novo usuário: ${fullName || cpf}`);
        // Criar novo usuário
        // Gerar senha temporária baseada no CPF
        const tempPassword = cpf.slice(-6); // Últimos 6 dígitos do CPF
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        user = await tx.user.create({
          data: {
            cpf,
            email,
            fullName,
            password: hashedPassword,
            points,
            organizationId,
            firstAccess: true,
          },
        });
        console.log(`✅ Novo usuário criado com ${user.points} pontos`);
      }

      // Registrar no histórico de pontos
      await tx.pointsHistory.create({
        data: {
          userId: user.id,
          pointsAdded: points,
          sourceDescription: `Importação de planilha`,
          pointsImportId,
        },
      });

      console.log(`📝 Histórico de pontos registrado para usuário ${user.id}`);
      return user;
    });
  }
}
