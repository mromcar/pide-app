export interface EstablishmentCreateDTO {
  name: string;
  tax_id?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billing_bank_details?: string | null;
  payment_bank_details?: string | null;
  contact_person?: string | null;
  description?: string | null;
  website?: string | null;
  is_active?: boolean | null;
  accepts_orders?: boolean; // Optional on create, defaults to true in schema
}

export interface EstablishmentUpdateDTO {
  name?: string;
  tax_id?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billing_bank_details?: string | null;
  payment_bank_details?: string | null;
  contact_person?: string | null;
  description?: string | null;
  website?: string | null;
  is_active?: boolean | null;
  accepts_orders?: boolean;
}

export interface EstablishmentDTO {
  establishment_id: number;
  name: string;
  tax_id?: string | null;
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  billing_bank_details?: string | null;
  payment_bank_details?: string | null;
  contact_person?: string | null;
  description?: string | null;
  website?: string | null;
  is_active?: boolean | null;
  accepts_orders: boolean;
  created_at?: string | null; // Dates as strings for DTOs
  updated_at?: string | null;
}
