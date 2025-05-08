import { Category } from '@/types/menu'

interface CategoryListProps {
    categories: Category[]
    onSelectCategory: (id: number) => void
    language: string
}

export default function CategoryList({ categories, onSelectCategory, language }: CategoryListProps) {
    return (
        <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
                <div
                    key={category.category_id}
                    className="cardMinimalista cursor-pointer"
                    onClick={() => onSelectCategory(category.category_id)}
                >
                    {category.image_url && (
                        <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                    )}
                    <h3 className="cardTitle">{category.name}</h3>
                </div>
            ))}
        </div>
    )
}
