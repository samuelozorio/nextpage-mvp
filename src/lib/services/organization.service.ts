import { prisma } from "@/lib/prisma";
import {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationWithUsers,
  OrganizationWithDetails,
} from "@/types/organization";
import { Prisma } from "@prisma/client";

export class OrganizationService {
  // Listar todas as organizações
  async findAll(): Promise<OrganizationWithUsers[]> {
    return await prisma.organization.findMany({
      include: {
        users: true,
        _count: {
          select: {
            users: true,
            ebooks: true,
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Buscar organização por ID
  async findById(id: string): Promise<OrganizationWithDetails | null> {
    return await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
        pointsImports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        ebooks: true,
        redemptions: {
          include: {
            user: true,
            ebook: true,
          },
          orderBy: { redeemedAt: "desc" },
          take: 10,
        },
      },
    });
  }

  // Buscar organização por slug (para rotas white label)
  async findBySlug(slug: string) {
    return await prisma.organization.findUnique({
      where: { slug },
    });
  }

  // Buscar organização por CNPJ
  async findByCnpj(cnpj: string) {
    return await prisma.organization.findUnique({
      where: { cnpj },
    });
  }

  // Criar nova organização
  async create(data: CreateOrganizationDTO) {
    // Verificar se slug já existe
    const existingSlug = await this.findBySlug(data.slug);
    if (existingSlug) {
      throw new Error("Slug já está em uso");
    }

    // Verificar se CNPJ já existe
    const existingCnpj = await this.findByCnpj(data.cnpj);
    if (existingCnpj) {
      throw new Error("CNPJ já está cadastrado");
    }

    return await prisma.organization.create({
      data,
      include: {
        users: true,
      },
    });
  }

  // Atualizar organização
  async update(data: UpdateOrganizationDTO) {
    const { id, ...updateData } = data;

    // Se estiver atualizando slug, verificar se não existe
    if (updateData.slug) {
      const existingSlug = await prisma.organization.findUnique({
        where: {
          slug: updateData.slug,
          NOT: { id },
        },
      });
      if (existingSlug) {
        throw new Error("Slug já está em uso");
      }
    }

    // Se estiver atualizando CNPJ, verificar se não existe
    if (updateData.cnpj) {
      const existingCnpj = await prisma.organization.findUnique({
        where: {
          cnpj: updateData.cnpj,
          NOT: { id },
        },
      });
      if (existingCnpj) {
        throw new Error("CNPJ já está cadastrado");
      }
    }

    return await prisma.organization.update({
      where: { id },
      data: updateData,
      include: {
        users: true,
      },
    });
  }

  // Deletar organização
  async delete(id: string) {
    return await prisma.organization.delete({
      where: { id },
    });
  }

  // Ativar/desativar organização
  async toggleActive(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    return await prisma.organization.update({
      where: { id },
      data: { isActive: !organization.isActive },
    });
  }
}
