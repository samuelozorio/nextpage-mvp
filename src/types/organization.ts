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
export interface OrganizationForm {
  id: string;
  name: string;
  cnpj: string;
  slug: string;
  logoUrl?: string | null;
  loginImageUrl?: string | null;
  coverHeroUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationDTO {
  name: string;
  cnpj: string;
  slug: string;
  logoUrl?: string;
  loginImageUrl?: string;
  coverHeroUrl?: string;
  isActive?: boolean;
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

export interface UserForm {
  id: string;
  cpf: string;
  email?: string | null;
  fullName?: string | null;
  password: string;
  points: number;
  role: 'ADMIN_MASTER' | 'CLIENTE';
  organizationId?: string | null;
  isActive: boolean;
  firstAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
}

export interface CreateUserDTO {
  cpf: string;
  email?: string;
  fullName?: string;
  password: string;
  organizationId?: string;
  role?: 'ADMIN_MASTER' | 'CLIENTE';
  points?: number;
}

export interface UpdateUserDTO {
  id: string;
  email?: string;
  fullName?: string;
  points?: number;
  isActive?: boolean;
}

export interface EbookForm {
  id: string;
  title: string;
  author: string;
  description?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  ebookFileUrl?: string | null;
  pointsCost: number;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
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

export interface PointsImportRecord {
  cpf: string;
  points: number;
  fullName?: string;
  email?: string;
}

export interface PointsImportResult {
  success: boolean;
  totalRecords: number;
  successRecords: number;
  errorRecords: number;
  errors: {
    row: number;
    cpf: string;
    error: string;
  }[];
}

export interface PointsImportForm {
  id: string;
  fileName: string;
  organizationId: string;
  totalRecords: number;
  successRecords: number;
  errorRecords: number;
  status: 'PROCESSING' | 'COMPLETED' | 'PARTIAL' | 'ERROR';
  errorDetails?: string | null;
  importedBy: string;
  createdAt: Date;
  updatedAt: Date;
  organization?: Organization;
}
