import { Product } from './product';
import { Allergen } from './allergen'; // Assuming Allergen entity exists

export interface ProductAllergen {
  product_id: number;
  allergen_id: number;

  // Relations
  product?: Product;
  allergen?: Allergen;
}