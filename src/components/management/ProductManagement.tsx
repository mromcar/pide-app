'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Product } from '@/types/entities/product'
import type { Category } from '@/types/entities/category'
import type { LanguageCode } from '@/constants/languages'

interface ProductManagementProps {
  establishmentId: string
  languageCode: LanguageCode
}

export function ProductManagement({ establishmentId, languageCode }: ProductManagementProps) {
  const { t } = useTranslation(languageCode)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchData()
  }, [establishmentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/restaurants/${establishmentId}/menu/products`),
        fetch(`/api/restaurants/${establishmentId}/menu/categories`),
      ])

      if (productsRes.ok && categoriesRes.ok) {
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductExpansion = (productId: number) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProducts(newExpanded)
  }

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm(t.establishmentAdmin.menuManagement.products.confirmDelete)) return

    try {
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/products/${productId}`,
        {
          method: 'DELETE',
        }
      )
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleSubmit = async () => {
    setShowForm(false)
    await fetchData()
  }

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => product.categoryId.toString() === selectedCategory)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.establishmentAdmin.forms.loading}</p>
      </div>
    )
  }

  return (
    <div className="product-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <h2>{t.establishmentAdmin.menuManagement.products.title}</h2>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            {t.establishmentAdmin.menuManagement.products.addNew}
          </button>
        </div>

        {/* Category Filter */}
        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.categoryId} value={category.categoryId.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.productId} className="product-card">
            <div className="product-header">
              <div className="product-info">
                {/* ELIMINADO: Imagen del producto */}
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <span className="product-category">
                    {categories.find((c) => c.categoryId === product.categoryId)?.name}
                  </span>
                </div>
              </div>

              <div className="product-actions">
                <button
                  onClick={() => toggleProductExpansion(product.productId)}
                  className="btn btn-secondary btn-sm"
                >
                  {expandedProducts.has(product.productId) ? '▼' : '▶'} Variantes
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(product)
                    setShowForm(true)
                  }}
                  className="btn btn-outline btn-sm"
                >
                  {t.establishmentAdmin.menuManagement.products.edit}
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.productId)}
                  className="btn btn-danger btn-sm"
                >
                  {t.establishmentAdmin.menuManagement.products.delete}
                </button>
              </div>
            </div>

            {/* Variants Section */}
            {expandedProducts.has(product.productId) && (
              <div className="variants-section">
                <h4>Variantes</h4>
                {product.variants && product.variants.length > 0 ? (
                  <div className="variants-list">
                    {product.variants.map((variant) => (
                      <div key={variant.variantId} className="variant-item">
                        <span className="variant-name">{variant.variantDescription}</span>
                        <span className="variant-price">€{variant.price.toString()}</span>
                        <div className="variant-actions">
                          <button className="btn btn-outline btn-xs">Editar</button>
                          <button className="btn btn-danger btn-xs">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-variants">No hay variantes para este producto</p>
                )}
                <button className="btn btn-secondary btn-sm mt-2">+ Añadir Variante</button>
              </div>
            )}

            {/* Allergens Section */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="allergens-section">
                <h5>Alérgenos:</h5>
                <div className="allergens-list">
                  {product.allergens.map((allergen) => (
                    <span key={allergen.allergenId} className="allergen-tag">
                      {allergen.allergen?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          establishmentId={establishmentId}
          languageCode={languageCode}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

interface ProductFormProps {
  product: Product | null
  categories: Category[]
  establishmentId: string
  languageCode: LanguageCode
  onSubmit: (data: unknown) => void
  onCancel: () => void
}

function ProductForm({
  product,
  categories,
  establishmentId,
  languageCode,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { t } = useTranslation(languageCode)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    categoryId: product?.categoryId || categories[0]?.categoryId || '',
    isActive: product?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convierte a snake_case solo para la petición al backend
    const { categoryId, isActive, ...rest } = formData
    const payload = {
      ...rest,
      category_id: categoryId,
      is_active: isActive,
      establishment_id: establishmentId,
      language_code: languageCode,
    }

    onSubmit(payload)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>
          {product
            ? t.establishmentAdmin.menuManagement.products.edit
            : t.establishmentAdmin.menuManagement.products.addNew}
        </h3>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.description}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.category}</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
              required
            >
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              {t.establishmentAdmin.menuManagement.products.active}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              {t.establishmentAdmin.forms.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
              {t.establishmentAdmin.forms.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
