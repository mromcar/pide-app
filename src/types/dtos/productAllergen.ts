import { AllergenResponseDTO } from './allergen';

// DTO for creating the link
export interface ProductAllergenCreateDTO {
  productId: number;
  allergenId: number;
}

// DTO for response, might include allergen details
export interface ProductAllergenResponseDTO {
  productId: number;
  allergenId: number;
  allergen?: AllergenResponseDTO; // Optionally include full allergen details
}
