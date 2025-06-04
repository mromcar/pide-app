// ProductHistory is typically auto-generated or created internally.
// DTOs might only be needed for response/querying.

export interface ProductHistoryResponseDTO {
  id: number;
  product_id?: number | null;
  name?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  // updated_at?: string | null; // Reemplazado por changed_at
  changed_at: string; // Asegúrate de que siempre sea un string (ISO date)
  action_type: string; // O un tipo enum más específico si lo tienes
  user_id?: number | null;
  user_name?: string | null; // Nombre del usuario que realizó el cambio
}
