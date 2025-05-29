import { AllergenResponseDTO } from './allergen'; // Assuming AllergenResponseDTO exists

// DTO for creating the link
export interface ProductAllergenCreateDTO {
  product_id: number;
  allergen_id: number;
}

// DTO for response, might include allergen details
export interface ProductAllergenResponseDTO {
  product_id: number;
  allergen_id: number;
  allergen?: AllergenResponseDTO; // Optionally include full allergen details
}
