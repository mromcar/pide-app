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
    // --- NUEVAS CLAVES AÑADIDAS ---
    restaurantMenu: {
        title: string;
        description?: string;
        invalidRestaurantIdError: string;
        menuNotAvailableError: string;
        menuNoItems: string; // Clave que estaba causando error en MenuDisplay
        menuNoProductsInCategory: string;
    };
    productAllergens: string; // Clave que estaba causando error en MenuDisplay
    // --- FIN DE NUEVAS CLAVES ---
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
        backToMenu: 'Back to menu',
        restaurantMenu: {
            title: 'Restaurant Menu',
            description: 'Explore our delicious menu options.',
            invalidRestaurantIdError: 'Invalid Restaurant ID.',
            menuNotAvailableError: 'Menu currently unavailable. Please try again later.',
            menuNoItems: 'There are no items in the menu at the moment.',
            menuNoProductsInCategory: 'No products in this category yet.',
        },
        productAllergens: 'Allergens',
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
        backToMenu: 'Volver al menú',
        restaurantMenu: {
            title: 'Menú del Restaurante',
            description: 'Explora nuestras deliciosas opciones de menú.',
            invalidRestaurantIdError: 'ID de Restaurante Inválido.',
            menuNotAvailableError: 'Menú no disponible actualmente. Por favor, inténtalo más tarde.',
            menuNoItems: 'No hay elementos en el menú en este momento.',
            menuNoProductsInCategory: 'Aún no hay productos en esta categoría.',
        },
        productAllergens: 'Alérgenos',
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
        backToMenu: 'Retour au menu',
        restaurantMenu: {
            title: 'Menu du Restaurant',
            description: 'Découvrez nos délicieuses options de menu.',
            invalidRestaurantIdError: 'ID de restaurant invalide.',
            menuNotAvailableError: 'Menu actuellement indisponible. Veuillez réessayer plus tard.',
            menuNoItems: 'Il n\'y a aucun article dans le menu pour le moment.',
            menuNoProductsInCategory: 'Aucun produit dans cette catégorie pour le moment.',
        },
        productAllergens: 'Allergènes',
    }
}

import { DEFAULT_LANGUAGE } from '@/constants/languages'

export function getTranslation(lang: string): UITranslation {
    if (lang in uiTranslations) {
        return uiTranslations[lang as LanguageCode]
    }
    return uiTranslations[DEFAULT_LANGUAGE]
}
