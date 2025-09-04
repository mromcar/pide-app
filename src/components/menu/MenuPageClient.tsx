'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { LanguageCode } from '@/constants/languages'
import { useTranslation } from '@/hooks/useTranslation'
import { useCart } from '@/lib/cart-context'
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  ShoppingCartIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'

// ✅ IMPORTAR tipos específicos
import type { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import type { AllergenResponseDTO } from '@/types/dtos/allergen'
import type { MenuCategoryWithProducts } from '@/services/api/establishment.api' // ✅ USAR el tipo exportado

interface MenuPageClientProps {
  establishment: EstablishmentResponseDTO
  categories: MenuCategoryWithProducts[] // ✅ USAR tipo específico
  allergens: AllergenResponseDTO[]
  lang: LanguageCode
}

export default function MenuPageClient({
  establishment,
  categories,
  allergens,
  lang,
}: MenuPageClientProps) {
  const { t } = useTranslation(lang)
  const { setEstablishmentId, cartItems } = useCart()

  // ✅ Usar las traducciones del módulo restaurant-menu
  const menuT = t.restaurantMenu

  // ✅ MANTENER funcionalidad del carrito
  useEffect(() => {
    if (establishment?.establishmentId) {
      console.log(
        '🏪 MenuPageClient: Setting establishment ID in cart:',
        establishment.establishmentId
      )
      setEstablishmentId(establishment.establishmentId)

      if (typeof window !== 'undefined') {
        document.cookie = `currentEstablishmentId=${establishment.establishmentId}; path=/; max-age=${60 * 60 * 24 * 30}`
        console.log(
          '🍪 MenuPageClient: Establishment ID stored in cookie:',
          establishment.establishmentId
        )
      }
    }
  }, [establishment?.establishmentId, setEstablishmentId])

  // ✅ State para interfaz móvil
  const [customerName, setCustomerName] = useState('Mr. A')
  const [isEditingName, setIsEditingName] = useState(false)
  const [tableNumber] = useState('D1')
  const [currentCategoryId, setCurrentCategoryId] = useState<number>(categories[0]?.categoryId || 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategoryList, setShowCategoryList] = useState(false)

  // ✅ Refs para scroll detection
  const menuContentRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // ✅ Filter categories and products based on search
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      products:
        category.products?.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [],
    }))
    .filter((category) => category.products.length > 0)

  // ✅ Handle scroll to detect current category
  const handleScroll = useCallback(() => {
    if (!menuContentRef.current) return

    const scrollTop = menuContentRef.current.scrollTop
    const containerHeight = menuContentRef.current.clientHeight
    const midPoint = scrollTop + containerHeight / 3

    let currentCategory = filteredCategories[0]?.categoryId

    categoryRefs.current.forEach((element, categoryId) => {
      if (element) {
        const { offsetTop } = element
        if (offsetTop <= midPoint) {
          currentCategory = categoryId
        }
      }
    })

    setCurrentCategoryId(currentCategory || filteredCategories[0]?.categoryId || 0)
  }, [filteredCategories])

  // ✅ Setup scroll listener
  useEffect(() => {
    const menuElement = menuContentRef.current
    if (menuElement) {
      menuElement.addEventListener('scroll', handleScroll, { passive: true })
      return () => menuElement.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // ✅ Format price for display
  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`
  }

  // ✅ Handle category click
  const handleCategoryClick = (categoryId: number) => {
    const element = categoryRefs.current.get(categoryId)
    if (element && menuContentRef.current) {
      const offsetTop = element.offsetTop - 120
      menuContentRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
    }
    setShowCategoryList(false)
  }

  // ✅ Get current category for display
  const currentCategory = filteredCategories.find((cat) => cat.categoryId === currentCategoryId)

  console.log('🎨 MenuPageClient: Rendering mobile interface with:', {
    establishmentName: establishment?.name,
    establishmentId: establishment?.establishmentId,
    categoriesCount: filteredCategories?.length || 0,
    allergensCount: allergens?.length || 0,
    cartItemsCount: cartItems?.length || 0,
  })

  return (
    <div className="menu-mobile-container">
      {/* Fixed Header */}
      <header className="menu-mobile-header">
        {/* Top Row: Table Info + Service Buttons + Cart */}
        <div className="menu-header-top-row">
          {/* Table Info */}
          <div className="menu-table-info">
            <span className="table-label">
              {menuT.table} {tableNumber} |
            </span>
            {isEditingName ? (
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="customer-name-input"
                placeholder={menuT.customerName}
                autoFocus
              />
            ) : (
              <button onClick={() => setIsEditingName(true)} className="customer-name-button">
                {customerName}
              </button>
            )}
          </div>

          {/* Service Buttons */}
          <div className="menu-service-buttons">
            <button className="menu-service-btn call-waiter" title={menuT.callWaiter}>
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button className="menu-service-btn" title={menuT.requestCutlery}>
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </button>
            <button className="menu-service-btn" title={menuT.refillDrinks}>
              <BeakerIcon className="w-5 h-5" />
            </button>
            <button className="menu-service-btn" title={menuT.otherRequests}>
              <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Button */}
          <button className="menu-cart-button" title={menuT.viewCart}>
            <ShoppingCartIcon className="w-6 h-6" />
            {cartItems && cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </button>
        </div>

        {/* Establishment Info */}
        <div className="menu-establishment-info">
          <div className="menu-establishment-logo">{establishment.name.charAt(0)}</div>
          <h1 className="menu-establishment-name">{establishment.name}</h1>
        </div>

        {/* Search & Categories Navigation */}
        <div className="menu-navigation-bar">
          {/* Search */}
          <div className="menu-search-container">
            <MagnifyingGlassIcon className="w-5 h-5 menu-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={menuT.searchMenu}
              className="menu-search-input"
            />
          </div>

          {/* Category List Toggle */}
          <button
            onClick={() => setShowCategoryList(!showCategoryList)}
            className="category-list-toggle"
            title={menuT.toggleCategoryList}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {/* Horizontal Categories */}
          <div className="menu-categories-scroll">
            {filteredCategories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => handleCategoryClick(category.categoryId)}
                className={`menu-category-pill ${
                  currentCategoryId === category.categoryId ? 'active' : ''
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Category Title */}
        <div className="menu-current-category">
          <h2>{currentCategory?.name || filteredCategories[0]?.name}</h2>
        </div>
      </header>

      {/* Category List Modal */}
      {showCategoryList && (
        <div className="category-list-modal">
          <div className="category-list-content">
            {filteredCategories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => handleCategoryClick(category.categoryId)}
                className={`category-list-item ${
                  currentCategoryId === category.categoryId ? 'active' : ''
                }`}
              >
                <span>{category.name}</span>
                <span className="product-count">({category.products?.length || 0})</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowCategoryList(false)} className="category-list-close">
            {menuT.close}
          </button>
        </div>
      )}

      {/* Scrollable Menu Content */}
      <main className="menu-content-scroll" ref={menuContentRef}>
        {filteredCategories.length === 0 && searchQuery && (
          <div className="no-results">
            <p>{menuT.noResultsFound}</p>
            <p>{menuT.tryDifferentSearch}</p>
          </div>
        )}

        {filteredCategories.map((category) => (
          <section
            key={category.categoryId}
            ref={(el) => {
              if (el) {
                categoryRefs.current.set(category.categoryId, el as HTMLDivElement)
              } else {
                categoryRefs.current.delete(category.categoryId)
              }
            }}
            className="category-section"
            data-category-id={category.categoryId}
          >
            {/* Products */}
            <div className="menu-product-grid">
              {category.products?.map((product) => (
                <div key={product.productId} className="menu-product-card">
                  {/* Product Image */}
                  <div className="menu-product-image">{product.name.charAt(0)}</div>

                  {/* Product Info */}
                  <div className="menu-product-info">
                    <h3 className="menu-product-name">{product.name}</h3>

                    {product.description && (
                      <p className="menu-product-description">{product.description}</p>
                    )}

                    {/* Allergens */}
                    {product.allergens && product.allergens.length > 0 && (
                      <div className="menu-product-allergens">
                        <span className="allergen-label">{menuT.allergens}:</span>
                        {product.allergens.map((allergen) => (
                          <span
                            key={allergen.allergen?.allergenId}
                            className="menu-allergen-badge"
                            title={allergen.allergen?.name}
                          >
                            {allergen.allergen?.code}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Variants & Prices */}
                    <div className="menu-product-variants">
                      {product.variants?.map((variant) => (
                        <div key={variant.variantId} className="menu-variant-item">
                          <span className="menu-variant-description">
                            {variant.variantDescription}
                          </span>
                          <span className="menu-variant-price">{formatPrice(variant.price)}</span>
                          <button className="add-to-cart-btn" title={menuT.addToCart}>
                            {menuT.addToCart}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Bottom padding for last category */}
        <div className="menu-bottom-padding" />
      </main>
    </div>
  )
}
