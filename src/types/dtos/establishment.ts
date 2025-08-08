import { CategoryDTO } from './category';
import { UserResponseDTO } from './user';

export interface EstablishmentCreateDTO {
  name: string;
  taxId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billingBankDetails?: string | null;
  paymentBankDetails?: string | null;
  contactPerson?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  acceptsOrders?: boolean; // Optional on create, defaults to true in schema
}

export interface EstablishmentUpdateDTO {
  name?: string;
  taxId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billingBankDetails?: string | null;
  paymentBankDetails?: string | null;
  contactPerson?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  acceptsOrders?: boolean;
}

export interface EstablishmentDTO {
  establishmentId: number;
  name: string;
  taxId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billingBankDetails?: string | null;
  paymentBankDetails?: string | null;
  contactPerson?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  acceptsOrders: boolean;
  createdAt?: string | null; // Dates as strings for DTOs
  updatedAt?: string | null;
}

export interface EstablishmentResponseDTO {
  establishmentId: number;
  name: string;
  taxId?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billingBankDetails?: string | null;
  paymentBankDetails?: string | null;
  contactPerson?: string | null;
  description?: string | null;
  website?: string | null;
  isActive?: boolean | null;
  acceptsOrders: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  categories?: CategoryDTO[];
  administrators?: UserResponseDTO[];
}
