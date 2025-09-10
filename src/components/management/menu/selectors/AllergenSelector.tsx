import type { UIAllergen } from '@/types/management/menu'
import { allergenIcons } from '@/components/icons/AllergenIcons'

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
        const anyA = a as any
        const code: string | undefined = anyA.code ?? anyA.slug ?? undefined
        const Icon = code ? (allergenIcons as any)[code] : undefined
        return (
          <label
            key={a.id}
            className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs ${
              checked ? 'border-black bg-neutral-50' : 'border-neutral-200'
            }`}
            title={(a as any).name}
          >
            <input
              type="checkbox"
              className="mr-1"
              checked={checked}
              onChange={(e) => {
                const next = new Set(selectedIds)
                if (e.target.checked) next.add(a.id)
                else next.delete(a.id)
                onChange(Array.from(next))
              }}
            />
            {Icon ? <Icon size={14} className="text-neutral-600" /> : null}
            <span>{(a as any).name}</span>
          </label>
        )
      })}
    </div>
  )
}
