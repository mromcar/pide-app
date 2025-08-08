export interface ProductVariantHistoryResponseDTO {
  id: number;
  variantId?: number | null;
  variantDescription?: string | null;
  price?: number | null; // Or string
  isActive?: boolean | null;
  updatedAt?: string | null;
}
