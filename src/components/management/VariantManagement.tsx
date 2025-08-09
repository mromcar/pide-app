'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { ProductVariant } from '@/types/entities/productVariant'
import type { Product } from '@/types/entities/product'
import type { LanguageCode } from '@/constants/languages'

interface VariantManagementProps {
  establishmentId: string
  languageCode: LanguageCode
}

// Componente principal
export function VariantManagement({ establishmentId, languageCode }: VariantManagementProps) {
  const { t } = useTranslation(languageCode)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [establishmentId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [variantsRes, productsRes] = await Promise.all([
        fetch(`/api/restaurants/${establishmentId}/menu/variants`),
        fetch(`/api/restaurants/${establishmentId}/menu/products`),
      ])

      if (variantsRes.ok && productsRes.ok) {
        const [variantsData, productsData] = await Promise.all([
          variantsRes.json(),
          productsRes.json(),
        ])
        setVariants(variantsData)
        setProducts(productsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVariant = async (variantId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta variante?')) return

    try {
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/variants/${variantId}`,
        {
          method: 'DELETE',
        }
      )
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting variant:', error)
    }
  }

  const filteredVariants =
    selectedProduct === 'all'
      ? variants
      : variants.filter((variant) => variant.productId.toString() === selectedProduct)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t.establishmentAdmin.forms.loading}</p>
      </div>
    )
  }

  return (
    <div className="variant-management">
      {/* Header */}
      <div className="management-header">
        <div className="header-content">
          <h2>{t.establishmentAdmin.menuManagement.variants.title}</h2>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            {t.establishmentAdmin.menuManagement.variants.addNew}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t.establishmentAdmin.menuManagement.variants.allProducts}</option>
          {products.map((product) => (
            <option key={product.productId} value={product.productId.toString()}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Variants List */}
      <div className="variants-grid">
        {filteredVariants.map((variant) => (
          <div key={variant.variantId} className="variant-card">
            <div className="variant-info">
              <h3>{variant.variantDescription}</h3>
              <p className="variant-price">${variant.price.toString()}</p>
              <p className="variant-sku">SKU: {variant.sku}</p>
              <span
                className={`status-badge ${variant.isActive ? 'status-active' : 'status-inactive'}`}
              >
                {variant.isActive
                  ? t.establishmentAdmin.forms.active
                  : t.establishmentAdmin.forms.inactive}
              </span>
            </div>
            <div className="variant-actions">
              <button
                onClick={() => {
                  setEditingVariant(variant)
                  setShowForm(true)
                }}
                className="btn btn-secondary"
              >
                {t.establishmentAdmin.forms.edit}
              </button>
              <button
                onClick={() => handleDeleteVariant(variant.variantId)}
                className="btn btn-danger"
              >
                {t.establishmentAdmin.forms.delete}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <VariantForm
          variant={editingVariant}
          products={products}
          establishmentId={establishmentId}
          languageCode={languageCode}
          onSubmit={async (data) => {
            // Aquí deberías convertir a snake_case antes de enviar al backend si es necesario
            await fetchData()
            setShowForm(false)
            setEditingVariant(null)
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingVariant(null)
          }}
        />
      )}
    </div>
  )
}

interface VariantFormData {
  productId: number
  variantDescription: string
  price: number
  sku?: string
  isActive: boolean
  establishmentId: string
}

interface VariantFormProps {
  variant: ProductVariant | null
  products: Product[]
  establishmentId: string
  languageCode: LanguageCode
  onSubmit: (data: VariantFormData) => void
  onCancel: () => void
}

function VariantForm({
  variant,
  products,
  establishmentId,
  languageCode,
  onSubmit,
  onCancel,
}: VariantFormProps) {
  const { t } = useTranslation(languageCode)
  const [formData, setFormData] = useState({
    productId: variant?.productId || products[0]?.productId || '',
    variantDescription: variant?.variantDescription || '',
    price: variant?.price?.toString() || '',
    sku: variant?.sku || '',
    isActive: variant?.isActive ?? true,
    establishmentId,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      productId: Number(formData.productId),
      price: parseFloat(formData.price),
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>
          {variant
            ? t.establishmentAdmin.menuManagement.variants.edit
            : t.establishmentAdmin.menuManagement.variants.addNew}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.variants.product}</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.variants.description}</label>
            <input
              type="text"
              value={formData.variantDescription}
              onChange={(e) => setFormData({ ...formData, variantDescription: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.variants.price}</label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.variants.sku}</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              {t.establishmentAdmin.forms.active}
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              {t.establishmentAdmin.forms.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
              {variant ? t.establishmentAdmin.forms.update : t.establishmentAdmin.forms.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
