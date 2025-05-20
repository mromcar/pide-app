// src/app/restaurant/[id]/menu/components/AllergenList.tsx
import { Allergen } from '@/types/menu'
import { allergenContainerClasses, allergenItemClasses } from '@/utils/tailwind'
import { uiTranslations } from '@/translations/ui' // Asumo que tienes un archivo uiTranslations

interface AllergenListProps {
  allergens?: {
    allergen: Allergen
    allergen_id: number
  }[]
  language: string // Cambiado a string para ser consistente con LanguageCode
}

const getAllergenDisplay = (allergen: Allergen, language: string) => {
  const translation = allergen.translations?.find((t) => t.language_code === language)
  return translation?.name || allergen.name
}

export default function AllergenList({ allergens, language }: AllergenListProps) {
  const t = uiTranslations[language as keyof typeof uiTranslations] // Acceder a las traducciones

  if (!allergens || allergens.length === 0) return null

  return (
    <div className={allergenContainerClasses}>
      {allergens.map(({ allergen }) => (
        <div
          key={allergen.allergen_id}
          className={allergenItemClasses}
          title={getAllergenDisplay(allergen, language)} // Usa el nombre traducido para el título
        >
          {allergen.icon_url && (
            <img
              src={`/images/allergens/${allergen.icon_url}`}
              alt={getAllergenDisplay(allergen, language)} // Usa el nombre traducido para el alt
              className="w-4 h-4"
            />
          )}
        </div>
      ))}
    </div>
  )
}
