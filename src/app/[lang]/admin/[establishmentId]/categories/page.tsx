'use client'

import { useTranslation } from '@/hooks/useTranslation'
import CategoryList from '@/components/management/menu/CategoryList'
import { useCategories } from '@/hooks/queries/menu'
import type { MenuCategory } from '@/types/management/menu'
import type { CategoryUpdateDTO, CategoryCreateDTO } from '@/types/dtos/category'
import type { LanguageCode } from '@/constants/languages'
import AdminNavbar from '@/components/admin/AdminNavbar'
import { getEstablishmentById } from '@/services/api/establishment.api'
import { useEffect, useState } from 'react'

interface CategoriesPageProps {
  params: { lang: LanguageCode; establishmentId: string }
}

export default function CategoriesPage({ params }: CategoriesPageProps) {
  const { lang, establishmentId } = params
  const { t } = useTranslation(lang)
  const { categoriesQ, createM, updateM, deleteM } = useCategories(Number(establishmentId))

  // Recupera el objeto establishment igual que en la página padre
  const [establishment, setEstablishment] = useState<any>(null)
  useEffect(() => {
    getEstablishmentById(Number(establishmentId)).then(setEstablishment)
  }, [establishmentId])

  // Mapea el draft a CategoryCreateDTO
  const handleCreate = async (draft: Omit<MenuCategory, 'id'>) => {
    const translationsArr = Object.entries(draft.translations ?? {}).map(
      ([languageCode, value]) => ({
        languageCode,
        name: value.name,
      })
    )
    const dto: CategoryCreateDTO = {
      establishmentId: Number(establishmentId),
      name: draft.translations?.[lang]?.name ?? '',
      sortOrder: draft.order ?? null,
      isActive: draft.active ?? null,
      translations: translationsArr,
    }
    await createM.mutateAsync(dto)
  }

  const handleUpdate = async (id: number, dto: CategoryUpdateDTO) => {
    await updateM.mutateAsync({ id, ...dto })
  }

  const handleReorder = async (nextOrders: Array<{ id: number; order: number }>) => {
    // Implementa la mutación si existe, si no, deja vacío
  }

  return (
    <div className="admin-page">
      <AdminNavbar
        languageCode={lang}
        establishmentId={establishmentId}
        establishment={establishment}
      />
      <h1 className="admin-page-title">{t.establishmentAdmin.menuManagement.categories.title}</h1>
      <CategoryList
        lang={lang}
        categories={categoriesQ.data ?? []}
        onSelect={(id) => {
          window.location.href = `/${lang}/admin/${establishmentId}/menu/categories/${id}`
        }}
        onCreate={handleCreate}
        onDelete={async (id) => await deleteM.mutateAsync(id)}
        onUpdate={handleUpdate}
        onEdit={(id) => {
          window.location.href = `/${lang}/admin/${establishmentId}/menu/categories/${id}`
        }}
        onReorder={handleReorder}
      />
    </div>
  )
}
