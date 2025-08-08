import { Product } from './product';
import { Allergen } from './allergen';

export interface ProductAllergen {
  productId: number;
  allergenId: number;

  // Relations
  product?: Product;
  allergen?: Allergen;
}
