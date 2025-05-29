export interface ProductVariantHistoryResponseDTO {
  id: number;
  variant_id?: number | null;
  variant_description?: string | null;
  price?: number | null; // Or string
  is_active?: boolean | null;
  updated_at?: string | null;
}
