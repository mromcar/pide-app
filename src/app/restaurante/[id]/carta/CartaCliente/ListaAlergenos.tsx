import { Allergen } from '@/types/carta'
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
    <div className="mt-2 flex flex-wrap gap-1">
      {allergens.map(({ allergen }) => (
        <div
          key={allergen.allergen_id}
          className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full text-xs"
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
