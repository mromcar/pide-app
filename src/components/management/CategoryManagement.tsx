'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { CategoryDTO } from '@/types/dtos/category'
import type { LanguageCode } from '@/constants/languages'

// Definir la interfaz localmente para evitar conflictos
interface CategoryFormData {
  name: string
  sortOrder?: number
  isActive?: boolean
}

interface CategoryManagementProps {
  establishmentId: string
  languageCode: LanguageCode
  categories: CategoryDTO[]
  onCategoriesChange: (newCategories: CategoryDTO[]) => void
  selectedCategoryId: number | null
  onSelectCategory: (categoryId: number) => void
}

export function CategoryManagement({
  establishmentId,
  languageCode,
  categories,
  onCategoriesChange,
  selectedCategoryId,
  onSelectCategory,
}: CategoryManagementProps) {
  const { t } = useTranslation(languageCode)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/restaurants/${establishmentId}/menu/categories`)
      if (response.ok) {
        const data = await response.json()
        onCategoriesChange(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEditCategory = (category: CategoryDTO) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(
        `/api/restaurants/${establishmentId}/menu/categories/${categoryId}`,
        {
          method: 'DELETE',
        }
      )
      if (response.ok) {
        const updatedCategories = categories.filter((c) => c.categoryId !== categoryId)
        onCategoriesChange(updatedCategories)
        if (selectedCategoryId === categoryId && updatedCategories.length > 0) {
          onSelectCategory(updatedCategories[0].categoryId)
        }
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleFormSubmit = async (formData: CategoryFormData) => {
    try {
      const url = editingCategory
        ? `/api/restaurants/${establishmentId}/menu/categories/${editingCategory.categoryId}`
        : `/api/restaurants/${establishmentId}/menu/categories`

      const method = editingCategory ? 'PUT' : 'POST'

      const payload = {
        name: formData.name,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
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

  return (
    <div className="category-management">
      {/* Header */}
      <div className="section-header">
        <div>
          <h3>{t.establishmentAdmin.menuManagement.categories.title}</h3>
          <p className="section-subtitle">
            {categories.length} {t.establishmentAdmin.menuManagement.categories.title.toLowerCase()}
          </p>
        </div>
        <button onClick={handleAddCategory} className="btn btn-primary">
          <span>➕</span>
          {t.establishmentAdmin.menuManagement.categories.addNew}
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <CategoryCard
              key={category.categoryId}
              category={category}
              onEdit={() => handleEditCategory(category)}
              onDelete={() => setDeleteConfirm(category.categoryId.toString())}
              onSelect={() => onSelectCategory(category.categoryId)}
              isSelected={selectedCategoryId === category.categoryId}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No hay categorías</h3>
          <p>Crea tu primera categoría para empezar a organizar tu menú.</p>
          <button onClick={handleAddCategory} className="btn btn-secondary">
            Crear primera categoría
          </button>
        </div>
      )}

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
          <div className="modal modal-sm">
            <div className="modal-header">
              <h3>{t.establishmentAdmin.menuManagement.categories.confirmDelete}</h3>
              <button onClick={() => setDeleteConfirm(null)} className="modal-close">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>{t.establishmentAdmin.menuManagement.categories.deleteMessage}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary">
                {t.establishmentAdmin.menuManagement.categories.cancel}
              </button>
              <button
                onClick={() => handleDeleteCategory(parseInt(deleteConfirm))}
                className="btn btn-danger"
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

// Category Card Component
interface CategoryCardProps {
  category: CategoryDTO
  onEdit: () => void
  onDelete: () => void
  onSelect: () => void
  isSelected: boolean
}

function CategoryCard({ category, onEdit, onDelete, onSelect, isSelected }: CategoryCardProps) {
  return (
    <div className={`category-card ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
      <div className="category-image-container">
        <img
          src={`/images/categories/${category.categoryId}.jpg`}
          alt={category.name}
          className="category-image"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <div className="category-info">
        <h4 className="category-name">{category.name}</h4>
        <div className="category-actions">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="btn btn-sm btn-secondary"
          >
            ✏️ Editar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="btn btn-sm btn-danger"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// Category Form Component
interface CategoryFormProps {
  category: CategoryDTO | null
  languageCode: LanguageCode
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
}

function CategoryForm({ category, languageCode, onSubmit, onCancel }: CategoryFormProps) {
  const { t } = useTranslation(languageCode)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    sortOrder: category?.sortOrder || 0,
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <h3>
            {category
              ? t.establishmentAdmin.menuManagement.categories.edit
              : t.establishmentAdmin.menuManagement.categories.addNew}
          </h3>
          <button onClick={onCancel} className="modal-close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="name">{t.establishmentAdmin.menuManagement.categories.name}</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Entrantes, Platos principales..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="sortOrder">Orden</label>
              <input
                id="sortOrder"
                type="number"
                className="form-input"
                value={formData.sortOrder || 0}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
                min="0"
              />
            </div>

            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                {t.establishmentAdmin.menuManagement.categories.active}
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              {t.establishmentAdmin.menuManagement.categories.cancel}
            </button>
            <button type="submit" className="btn btn-primary">
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
