'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { Category } from '@/types/entities/category'
import type { LanguageCode } from '@/constants/languages'

// Definir la interfaz localmente para evitar conflictos
interface CategoryFormData {
  name: string
  imageUrl?: string
  sortOrder?: number
  isActive?: boolean
}

interface CategoryManagementProps {
  establishmentId: string
  languageCode: LanguageCode
}

export function CategoryManagement({ establishmentId, languageCode }: CategoryManagementProps) {
  const { t } = useTranslation(languageCode)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [establishmentId])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/establishments/${establishmentId}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchCategories()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleFormSubmit = async (formData: CategoryFormData) => {
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.categoryId}`
        : `/api/establishments/${establishmentId}/categories`

      const method = editingCategory ? 'PUT' : 'POST'

      // Convierte a snake_case solo para la petición
      const payload = {
        name: formData.name,
        image_url: formData.imageUrl,
        sort_order: formData.sortOrder,
        is_active: formData.isActive,
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchCategories()
        setShowForm(false)
        setEditingCategory(null)
      }
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="category-management">
      {/* Header */}
      <div className="management-header">
        <h2 className="management-title">{t.establishmentAdmin.menuManagement.categories.title}</h2>
        <button onClick={handleAddCategory} className="btn-primary">
          {t.establishmentAdmin.menuManagement.categories.addNew}
        </button>
      </div>

      {/* Categories Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>{t.establishmentAdmin.menuManagement.categories.name}</th>
              <th>{t.establishmentAdmin.menuManagement.categories.description}</th>
              <th>{t.establishmentAdmin.menuManagement.categories.active}</th>
              <th>{t.establishmentAdmin.menuManagement.categories.actions}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.categoryId}>
                <td>{category.name}</td>
                <td>-</td>
                <td>
                  <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="btn-secondary btn-sm"
                    >
                      {t.establishmentAdmin.menuManagement.categories.edit}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(category.categoryId.toString())}
                      className="btn-danger btn-sm"
                    >
                      {t.establishmentAdmin.menuManagement.categories.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          languageCode={languageCode}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {t.establishmentAdmin.menuManagement.categories.confirmDelete}
              </h3>
            </div>
            <div className="modal-body">
              <p>{t.establishmentAdmin.menuManagement.categories.deleteMessage}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">
                {t.establishmentAdmin.menuManagement.categories.cancel}
              </button>
              <button
                onClick={() => handleDeleteCategory(parseInt(deleteConfirm))}
                className="btn-danger"
              >
                {t.establishmentAdmin.menuManagement.categories.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Category Form Component
interface CategoryFormProps {
  category: Category | null
  languageCode: LanguageCode
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
}

function CategoryForm({ category, languageCode, onSubmit, onCancel }: CategoryFormProps) {
  const { t } = useTranslation(languageCode)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    imageUrl: category?.imageUrl || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="modal-title">
            {category
              ? t.establishmentAdmin.menuManagement.categories.edit
              : t.establishmentAdmin.menuManagement.categories.addNew}
          </h3>
          <button onClick={onCancel} className="modal-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">
              {t.establishmentAdmin.menuManagement.categories.name}
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className="form-input"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sort Order</label>
            <input
              type="number"
              className="form-input"
              value={formData.sortOrder || 0}
              onChange={(e) =>
                setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
              }
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              {t.establishmentAdmin.menuManagement.categories.active}
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn-secondary">
              {t.establishmentAdmin.menuManagement.categories.cancel}
            </button>
            <button type="submit" className="btn-primary">
              {category
                ? t.establishmentAdmin.menuManagement.categories.update
                : t.establishmentAdmin.menuManagement.categories.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
