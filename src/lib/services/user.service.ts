import { prisma } from "@/lib/prisma";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserWithOrganization,
} from "@/types/organization";
import bcrypt from "bcryptjs";

export class UserService {
  // Buscar usuário por CPF
  async findByCpf(cpf: string): Promise<UserWithOrganization | null> {
    return await prisma.user.findUnique({
      where: { cpf },
      include: {
        organization: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });
  }

  // Buscar usuário por ID
  async findById(id: string): Promise<UserWithOrganization | null> {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });
  }

  // Buscar usuário por email
  async findByEmail(email: string): Promise<UserWithOrganization | null> {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });
  }

  // Autenticar usuário
  async authenticate(
    cpf: string,
    password: string
  ): Promise<UserWithOrganization | null> {
    const user = await this.findByCpf(cpf);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Autenticar usuário por organização
  async authenticateByOrganization(
    cpf: string,
    password: string,
    organizationSlug: string
  ): Promise<UserWithOrganization | null> {
    const user = await prisma.user.findFirst({
      where: {
        cpf,
        isActive: true,
        organization: {
          slug: organizationSlug,
          isActive: true,
        },
      },
      include: {
        organization: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Criar usuário
  async create(data: CreateUserDTO): Promise<UserWithOrganization> {
    const hashedPassword = await bcrypt.hash(data.password, 12);

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        organization: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });
  }

  // Atualizar usuário
  async update(data: UpdateUserDTO): Promise<UserWithOrganization> {
    const updateData: any = { ...data };
    delete updateData.id;

    // Se estiver atualizando senha, fazer hash
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }

    return await prisma.user.update({
      where: { id: data.id },
      data: updateData,
      include: {
        organization: true,
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });
  }

  // Deletar usuário
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  }

  // Ativar/desativar usuário
  async toggleActive(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    return await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  // Atualizar pontos do usuário
  async updatePoints(id: string, points: number) {
    return await prisma.user.update({
      where: { id },
      data: { points },
    });
  }

  // Marcar primeiro acesso como concluído
  async markFirstAccessComplete(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { firstAccess: false },
    });
  }
}
