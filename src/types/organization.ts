import {
  Organization,
  User,
  Ebook,
  Redemption,
  PointsImport,
  UserRole,
  ImportStatus,
} from "@prisma/client";

// Tipos base do Prisma
export type {
  Organization,
  User,
  Ebook,
  Redemption,
  PointsImport,
  UserRole,
  ImportStatus,
} from "@prisma/client";

// Tipos com relacionamentos
export type OrganizationWithUsers = Organization & {
  users: User[];
  _count?: {
    users: number;
    ebooks: number;
    redemptions: number;
  };
};

export type OrganizationWithDetails = Organization & {
  users: User[];
  pointsImports: PointsImport[];
  ebooks: Ebook[];
  redemptions: Redemption[];
};

export type UserWithOrganization = User & {
  organization?: Organization | null;
  _count?: {
    redemptions: number;
  };
};

export type EbookWithRedemptions = Ebook & {
  redemptions: Redemption[];
  _count?: {
    redemptions: number;
  };
};

export type RedemptionWithDetails = Redemption & {
  user: User;
  ebook: Ebook;
  organization: Organization;
};

export type PointsImportWithDetails = PointsImport & {
  organization: Organization;
};

// DTOs para formulários
export interface CreateOrganizationDTO {
  name: string;
  cnpj: string;
  slug: string;
  logoUrl?: string;
  loginImageUrl?: string;
  coverHeroUrl?: string;
}

export interface UpdateOrganizationDTO {
  id: string;
  name?: string;
  cnpj?: string;
  slug?: string;
  logoUrl?: string;
  loginImageUrl?: string;
  coverHeroUrl?: string;
  isActive?: boolean;
}

export interface CreateUserDTO {
  cpf: string;
  email?: string;
  fullName?: string;
  password: string;
  organizationId?: string;
  role?: "ADMIN_MASTER" | "CLIENTE";
}

export interface UpdateUserDTO {
  id: string;
  email?: string;
  fullName?: string;
  points?: number;
  isActive?: boolean;
}

export interface CreateEbookDTO {
  title: string;
  author: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  ebookFileUrl?: string;
  pointsCost?: number;
  organizationId?: string;
}

export interface UpdateEbookDTO {
  id: string;
  title?: string;
  author?: string;
  description?: string;
  category?: string;
  coverImageUrl?: string;
  ebookFileUrl?: string;
  pointsCost?: number;
  isActive?: boolean;
}
