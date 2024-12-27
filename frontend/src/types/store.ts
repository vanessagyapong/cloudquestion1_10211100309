export type StoreStatus = "pending" | "approved" | "rejected";

export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface SocialLinks {
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
}

export interface Store {
  _id: string;
  name: string;
  description: string;
  owner: string; // User ID
  status: StoreStatus;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  totalSales: number;
  balance: number;
  logo?: string;
  banner?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: SocialLinks;
  businessHours?: BusinessHours;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateStoreData {
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Partial<SocialLinks>;
  businessHours?: Partial<BusinessHours>;
}

export interface UpdateStoreData {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: Partial<SocialLinks>;
  businessHours?: Partial<BusinessHours>;
}
