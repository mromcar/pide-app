import { Allergen } from '@/types/menu'
import { allergenContainerClasses, allergenItemClasses } from '@/utils/tailwind'

interface ListaAlergenosProps {
  allergens?: {
    allergen: Allergen
    allergen_id: number
  }[]
  language: string
}

const getAllergenDisplay = (allergen: Allergen, language: string) => {
  const translation = allergen.translations?.find((t) => t.language_code === language)
  return translation?.name || allergen.name
}

export default function ListaAlergenos({ allergens, language }: ListaAlergenosProps) {
  if (!allergens || allergens.length === 0) return null

  return (
    <div className={allergenContainerClasses}>
      {allergens.map(({ allergen }) => (
        <div
          key={allergen.allergen_id}
          className={allergenItemClasses}
          title={getAllergenDisplay(allergen, language)}
        >
          {allergen.icon_url && (
            <img
              src={`/images/allergens/${allergen.icon_url}`}
              alt={allergen.name}
              className="w-4 h-4"
            />
          )}
        </div>
      ))}
    </div>
  )
}
