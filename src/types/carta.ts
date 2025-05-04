export type ProductoTraduccion = {
  nombre: string
  descripcion?: string
  idioma: string
}

export type Producto = {
  id_producto: number
  nombre: string
  descripcion?: string
  precio: number
  imagen_url?: string
  ProductoTraduccion: ProductoTraduccion[]
}

export type Categoria = {
  id_categoria: number
  nombre: string
  imagen_url?: string
  productos: Producto[]
}
