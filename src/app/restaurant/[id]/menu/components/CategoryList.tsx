import { Category } from '@/services/menu-services'

interface CategoryListProps {
  categories: Category[]
  onSelectCategory: (id: number) => void
  language: string
}

export default function CategoryList({ categories, onSelectCategory }: CategoryListProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {categories.map((category) => {
        const translation = category.translations[0]
        const translatedName = translation?.name || category.name

        return (
          <div
            key={category.category_id}
            className="cardMinimalista cursor-pointer"
            onClick={() => onSelectCategory(category.category_id)}
          >
            {category.image_url && (
              <img
                src={category.image_url}
                alt={translatedName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="cardTitle">{translatedName}</h3>
          </div>
        )
      })}
    </div>
  )
}
