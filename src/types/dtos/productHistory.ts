// ProductHistory is typically auto-generated or created internally.
// DTOs might only be needed for response/querying.

export interface ProductHistoryResponseDTO {
  id: number;
  productId?: number | null;
  name?: string | null;
  description?: string | null;
  isActive?: boolean | null;
  changedAt: string; // ISO date string
  actionType: string; // Or a more specific enum type if you have one
  userId?: number | null;
  userName?: string | null; // Name of the user who made the change
}
