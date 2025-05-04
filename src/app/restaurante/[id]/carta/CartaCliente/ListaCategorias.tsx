import { categoriaSectionClasses, categoriaTituloClasses } from '@/utils/tailwind'

type Categoria = {
  id_categoria: number
  nombre: string
  imagen_url?: string
}

export default function ListaCategorias({
  categorias,
  onSelectCategoria,
}: {
  categorias: Categoria[]
  onSelectCategoria: (id: number) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {categorias.map((categoria) => (
        <section
          key={categoria.id_categoria}
          className={categoriaSectionClasses}
          onClick={() => onSelectCategoria(categoria.id_categoria)}
        >
          <h2 className={categoriaTituloClasses}>{categoria.nombre}</h2>
          {categoria.imagen_url && (
            <img
              src={`/images/${categoria.imagen_url}`}
              alt={categoria.nombre}
              className="w-full h-48 object-cover rounded-xl mb-4"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
        </section>
      ))}
    </div>
  )
}
