// ProductHistory is typically auto-generated or created internally.
// DTOs might only be needed for response/querying.

export interface ProductHistoryResponseDTO {
  id: number;
  product_id?: number | null;
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  updated_at?: string | null; // Date as ISO string
}
