import type { LanguageCode } from '@/constants/languages'

interface UITranslation {
    backToCategories: string
    orderPlaced: string
    finishOrder: string
    cancelOrder: string
    placeAnotherOrder: string
    allergens: string
    variants: string
    total: string
    notes: string
    viewDetails: string
    backToMenu: string
}

export const uiTranslations: Record<LanguageCode, UITranslation> = {
    en: {
        backToCategories: 'Back to categories',
        orderPlaced: 'Order placed',
        finishOrder: 'Finish order',
        cancelOrder: 'Cancel order',
        placeAnotherOrder: 'Place another order',
        allergens: 'Allergens',
        variants: 'Variants',
        total: 'Total',
        notes: 'Notes',
        viewDetails: 'View details',
        backToMenu: 'Back to menu'
    },
    es: {
        backToCategories: 'Volver a categorías',
        orderPlaced: 'Pedido realizado',
        finishOrder: 'Finalizar pedido',
        cancelOrder: 'Cancelar pedido',
        placeAnotherOrder: 'Hacer otro pedido',
        allergens: 'Alérgenos',
        variants: 'Variantes',
        total: 'Total',
        notes: 'Notas',
        viewDetails: 'Ver detalles',
        backToMenu: 'Volver al menú'
    },
    fr: {
        backToCategories: 'Retour aux catégories',
        orderPlaced: 'Commande passée',
        finishOrder: 'Finaliser la commande',
        cancelOrder: 'Annuler la commande',
        placeAnotherOrder: 'Passer une autre commande',
        allergens: 'Allergènes',
        variants: 'Variantes',
        total: 'Total',
        notes: 'Remarques',
        viewDetails: 'Voir détails',
        backToMenu: 'Retour au menu'
    }
}

import { DEFAULT_LANGUAGE } from '@/constants/languages'

export function getTranslation(lang: string): UITranslation {
    if (lang in uiTranslations) {
        return uiTranslations[lang as LanguageCode]
    }
    return uiTranslations[DEFAULT_LANGUAGE]
}
