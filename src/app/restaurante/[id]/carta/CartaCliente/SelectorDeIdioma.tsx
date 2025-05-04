import Link from 'next/link'
import { idiomaSelectorClasses, idiomaBtnClasses } from '@/utils/tailwind'

export default function SelectorDeIdioma({
  idioma,
  idiomasDisponibles,
}: {
  idioma: string
  idiomasDisponibles: { code: string; label: string }[]
}) {
  return (
    <div className={idiomaSelectorClasses}>
      {idiomasDisponibles.map(({ code, label }) => (
        <Link
          key={code}
          href={`?lang=${code}`}
          className={idiomaBtnClasses(code === idioma)}
          scroll={false}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
