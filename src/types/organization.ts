// Tipos base (mock por enquanto, depois será substituído pelo Prisma)
export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  slug: string;
  logoUrl: string | null;
  loginImageUrl: string | null;
  coverHeroUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  cpf: string;
  name: string;
  email?: string;
  role: string;
  organizationId?: string;
  firstAccess: boolean;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ebook {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  fileUrl: string;
  pointsRequired: number;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Redemption {
  id: string;
  userId: string;
  ebookId: string;
  pointsSpent: number;
  redeemedAt: Date;
  createdAt: Date;
}

export interface PointsImport {
  id: string;
  organizationId: string;
  fileName: string;
  status: string;
  totalRows: number;
  processedRows: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
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

// Tipos estendidos
export interface OrganizationWithUsers extends Organization {
  users: User[];
  _count: {
    users: number;
    ebooks: number;
    redemptions: number;
  };
}

export interface OrganizationWithDetails extends Organization {
  users: User[];
  pointsImports: PointsImport[];
  ebooks: Ebook[];
  redemptions: (Redemption & {
    user: User;
    ebook: Ebook;
  })[];
}

export interface UserWithOrganization extends User {
  organization?: Organization;
}
