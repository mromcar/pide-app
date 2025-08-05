'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Product } from '@/types/entities/product'
import type { Category } from '@/types/entities/category'
import type { ProductVariant } from '@/types/entities/productVariant'
import type { LanguageCode } from '@/constants/languages'

interface ProductManagementProps {
  establishmentId: string
  language: LanguageCode
}

export function ProductManagement({ establishmentId, language }: ProductManagementProps) {
  const { t } = useTranslation(language)
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
        fetch(`/api/restaurants/${establishmentId}/menu/categories`)
      ])
      
      if (productsRes.ok && categoriesRes.ok) {
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json()
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
      const response = await fetch(`/api/restaurants/${establishmentId}/menu/products/${productId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category_id.toString() === selectedCategory)

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
          <button 
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
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
            {categories.map(category => (
              <option key={category.category_id} value={category.category_id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.product_id} className="product-card">
            <div className="product-header">
              <div className="product-info">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="product-image"
                  />
                )}
                <div className="product-details">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <span className="product-category">
                    {categories.find(c => c.category_id === product.category_id)?.name}
                  </span>
                </div>
              </div>
              
              <div className="product-actions">
                <button 
                  onClick={() => toggleProductExpansion(product.product_id)}
                  className="btn btn-secondary btn-sm"
                >
                  {expandedProducts.has(product.product_id) ? '▼' : '▶'} Variantes
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
                  onClick={() => handleDeleteProduct(product.product_id)}
                  className="btn btn-danger btn-sm"
                >
                  {t.establishmentAdmin.menuManagement.products.delete}
                </button>
              </div>
            </div>

            {/* Variants Section */}
            {expandedProducts.has(product.product_id) && (
              <div className="variants-section">
                <h4>Variantes</h4>
                {product.variants && product.variants.length > 0 ? (
                  <div className="variants-list">
                    {product.variants.map(variant => (
                      <div key={variant.variant_id} className="variant-item">
                        <span className="variant-name">{variant.variant_description}</span>
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
                <button className="btn btn-secondary btn-sm mt-2">
                  + Añadir Variante
                </button>
              </div>
            )}

            {/* Allergens Section */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="allergens-section">
                <h5>Alérgenos:</h5>
                <div className="allergens-list">
                  {product.allergens.map(allergen => (
                    <span key={allergen.allergen_id} className="allergen-tag">
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
          language={language}
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
  language: LanguageCode
  onSubmit: (data: any) => void
  onCancel: () => void
}

function ProductForm({ product, categories, establishmentId, language, onSubmit, onCancel }: ProductFormProps) {
  const { t } = useTranslation(language)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    category_id: product?.category_id || categories[0]?.category_id || '',
    image_url: product?.image_url || '',
    is_active: product?.is_active ?? true
  })

  // ✅ Agregar la función handleSubmit
  const handleSubmit = async (data: ProductFormData) => {
  // Implementar lógica de envío
  console.log('Submitting product data:', data);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      establishment_id: establishmentId
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>
          {product 
            ? t.establishmentAdmin.menuManagement.products.edit
            : t.establishmentAdmin.menuManagement.products.addNew
          }
        </h3>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.description}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.category}</label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({...formData, category_id: parseInt(e.target.value)})}
              required
            >
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>{t.establishmentAdmin.menuManagement.products.image}</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              placeholder="URL de la imagen"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
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