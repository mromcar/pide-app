import { Category } from '@/types/carta'
import { categoriaSectionClasses, categoriaTituloClasses } from '@/utils/tailwind'

interface CategoryListProps {
  categories: Category[]
  onSelectCategory: (id: number) => void
  language: string
}

export default function CategoryList({
  categories,
  onSelectCategory,
  language,
}: CategoryListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {categories.map((category) => {
        const translation = category.translations?.find(
          (t) => t.language_code === language
        )
        const name = translation?.name || category.name

        return (
          <section
            key={category.category_id}
            className={categoriaSectionClasses}
            onClick={() => onSelectCategory(category.category_id)}
          >
            <h2 className={categoriaTituloClasses}>{name}</h2>
            {category.image_url && (
              <img
                src={`/images/${category.image_url}`}
                alt={name}
                className="w-full h-48 object-cover rounded-xl mb-4"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </section>
        )
      }
      )}
    </div>
  )
}
