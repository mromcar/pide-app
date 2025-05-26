// src/types/serialized/category.ts

// Assuming a serialized category might want to inline the default language name
// and directly list product IDs or simplified products.
// This is highly dependent on your API needs.

export interface SerializedCategoryTranslation {
  languageCode: string;
  name: string;
  description?: string | null;
}

export interface SerializedCategory {
  categoryId: number;
  establishmentId: number;
  name: string; // Default name
  imageUrl?: string | null;
  sortOrder?: number;
  isActive: boolean;
  translations?: SerializedCategoryTranslation[]; // Or just the current language
  // productCount?: number; // Example of aggregated data
  // products?: SimplifiedProduct[]; // Example
}
