import type { UIAllergen } from '@/types/management/menu'

interface Props {
  allergens: UIAllergen[]
  selectedIds: Set<number>
  onChange: (ids: number[]) => void
}

export default function AllergenSelector({ allergens, selectedIds, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {allergens.map((a) => {
        const checked = selectedIds.has(a.id)
        return (
          <label key={a.id} className="inline-flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                const next = new Set(selectedIds)
                if (e.target.checked) next.add(a.id)
                else next.delete(a.id)
                onChange(Array.from(next))
              }}
            />
            <span>{a.name}</span>
          </label>
        )
      })}
    </div>
  )
}
