import React from 'react';
import { ProductAllergenResponseDTO } from '@/types/dtos/productAllergen';
import { allergenIcons, AllergenCode } from './icons/AllergenIcons';
import { LanguageCode } from '@/constants/languages';

interface AllergenDisplayProps {
  allergens: ProductAllergenResponseDTO[];
  lang: LanguageCode;
  className?: string;
}

const AllergenDisplay: React.FC<AllergenDisplayProps> = ({ allergens, lang, className = '' }) => {
  if (!allergens || allergens.length === 0) {
    return null;
  }

  return (
    <div className={`allergen-display ${className}`}>
      {allergens.map((productAllergen) => {
        const allergen = productAllergen.allergen;
        if (!allergen) return null;

        const IconComponent = allergenIcons[allergen.code as AllergenCode];
        if (!IconComponent) return null;

        // Obtener el nombre traducido
        const translation = allergen.translations?.find(t => t.language_code === lang);
        const allergenName = translation?.name || allergen.name;
        const allergenDescription = translation?.description || allergen.description;

        return (
          <div
            key={allergen.allergen_id}
            className="allergen-item"
            title={allergenDescription || allergenName}
          >
            <IconComponent 
              size={20} 
              className={`allergen-icon ${allergen.is_major_allergen ? 'major-allergen' : ''}`}
            />
            <span className="allergen-tooltip">{allergenName}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AllergenDisplay;