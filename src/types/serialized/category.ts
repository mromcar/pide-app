import { CategoryDTO } from '../dtos/category';

// For now, SerializedCategory can be the same as CategoryDTO
// Adjust if specific serialization differences are needed (e.g., for API responses)
export type SerializedCategory = CategoryDTO;
