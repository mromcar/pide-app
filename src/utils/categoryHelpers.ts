import type { CategoryCreateDTO, CategoryUpdateDTO } from '@/types/dtos/category'
import type { MenuCategory } from '@/types/management/menu'

export function mapCategoryUIToCreateDTO(ui: MenuCategory): CategoryCreateDTO {
  console.log('[categoryHelpers] mapCategoryUIToCreateDTO input UI:', ui)
  console.log('[categoryHelpers] ui.order (sortOrder):', ui.order, 'type:', typeof ui.order)
  console.log('[categoryHelpers] ui.active (isActive):', ui.active, 'type:', typeof ui.active)

  // Convert all translations that have content
  const translations = Object.entries(ui.translations)
    .filter(([_, trans]) => trans.name && trans.name.trim())
    .map(([languageCode, trans]) => ({
      languageCode,
      name: trans.name.trim(),
    }))

  const dto: CategoryCreateDTO = {
    establishmentId: 0, // Will be set in the hook
    name: ui.translations.es?.name || ui.translations.en?.name || '',
    sortOrder: ui.order, // Direct mapping - should be number
    isActive: ui.active, // Direct mapping - should be boolean
    translations,
  }

  console.log('[categoryHelpers] mapCategoryUIToCreateDTO output DTO:', dto)
  console.log('[categoryHelpers] DTO.sortOrder:', dto.sortOrder, 'type:', typeof dto.sortOrder)
  console.log('[categoryHelpers] DTO.isActive:', dto.isActive, 'type:', typeof dto.isActive)

  return dto
}

export function mapCategoryUIToUpdateDTO(ui: MenuCategory): CategoryUpdateDTO {
  console.log('[categoryHelpers] mapCategoryUIToUpdateDTO input UI:', ui)
  console.log('[categoryHelpers] ui.order (sortOrder):', ui.order, 'type:', typeof ui.order)
  console.log('[categoryHelpers] ui.active (isActive):', ui.active, 'type:', typeof ui.active)

  // Convert all translations that have content
  const translations = Object.entries(ui.translations)
    .filter(([_, trans]) => trans.name && trans.name.trim())
    .map(([languageCode, trans]) => ({
      languageCode,
      name: trans.name.trim(),
    }))

  const dto: CategoryUpdateDTO = {
    name: ui.translations.es?.name || ui.translations.en?.name || '',
    sortOrder: ui.order, // Direct mapping - should be number
    isActive: ui.active, // Direct mapping - should be boolean
    translations,
  }

  console.log('[categoryHelpers] mapCategoryUIToUpdateDTO output DTO:', dto)
  console.log('[categoryHelpers] DTO.sortOrder:', dto.sortOrder, 'type:', typeof dto.sortOrder)
  console.log('[categoryHelpers] DTO.isActive:', dto.isActive, 'type:', typeof dto.isActive)

  return dto
}
