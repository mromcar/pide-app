'use client'

import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'
import type { Establishment } from '@/types/entities/establishment'

interface MenuManagementProps {
  establishment: Establishment | null
  establishmentId: string
  activeTab: string
  onTabChange: (tab: string) => void
  languageCode: LanguageCode
}

export default function MenuManagement({
  establishment,
  establishmentId,
  activeTab,
  onTabChange,
  languageCode,
}: MenuManagementProps) {
  const { t } = useTranslation(languageCode)

  return (
    <div className="menu-management">
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">{t.establishmentAdmin.navigation.menuManagement}</h2>

          {/* Tabs */}
          <div className="menu-tabs">
            <button
              className={`menu-tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => onTabChange('categories')}
            >
              Categorías
            </button>
            <button
              className={`menu-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => onTabChange('products')}
            >
              Productos
            </button>
          </div>
        </div>

        <div className="admin-card-content">
          {activeTab === 'categories' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Gestión de Categorías</h3>
                <button className="btn-primary">+ Añadir Categoría</button>
              </div>

              {/* Mostrar información del establecimiento */}
              {establishment && (
                <div className="establishment-info-card">
                  <h4>Establecimiento: {establishment.name}</h4>
                  <p>ID: {establishmentId}</p>
                </div>
              )}

              <div className="categories-grid">
                <div className="category-card">
                  <h4>Bebidas</h4>
                  <p>12 productos</p>
                  <div className="category-actions">
                    <button className="btn-secondary-sm">Editar</button>
                    <button className="btn-danger-sm">Eliminar</button>
                  </div>
                </div>

                <div className="category-card">
                  <h4>Comidas</h4>
                  <p>8 productos</p>
                  <div className="category-actions">
                    <button className="btn-secondary-sm">Editar</button>
                    <button className="btn-danger-sm">Eliminar</button>
                  </div>
                </div>

                <div className="category-card">
                  <h4>Postres</h4>
                  <p>5 productos</p>
                  <div className="category-actions">
                    <button className="btn-secondary-sm">Editar</button>
                    <button className="btn-danger-sm">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="tab-header">
                <h3>Gestión de Productos</h3>
                <button className="btn-primary">+ Añadir Producto</button>
              </div>

              {/* Mostrar información del establecimiento */}
              {establishment && (
                <div className="establishment-info-card">
                  <h4>Establecimiento: {establishment.name}</h4>
                  <p>ID: {establishmentId}</p>
                </div>
              )}

              <div className="products-table">
                <div className="table-header">
                  <div>Producto</div>
                  <div>Categoría</div>
                  <div>Precio</div>
                  <div>Estado</div>
                  <div>Acciones</div>
                </div>

                <div className="table-row">
                  <div>
                    <div className="product-info">
                      <strong>Café Americano</strong>
                      <small>Café negro tradicional</small>
                    </div>
                  </div>
                  <div>Bebidas</div>
                  <div>€2.50</div>
                  <div>
                    <span className="status active">Activo</span>
                  </div>
                  <div className="row-actions">
                    <button className="btn-secondary-sm">Editar</button>
                    <button className="btn-danger-sm">Eliminar</button>
                  </div>
                </div>

                <div className="table-row">
                  <div>
                    <div className="product-info">
                      <strong>Hamburguesa Clásica</strong>
                      <small>Con queso y papas</small>
                    </div>
                  </div>
                  <div>Comidas</div>
                  <div>€8.90</div>
                  <div>
                    <span className="status active">Activo</span>
                  </div>
                  <div className="row-actions">
                    <button className="btn-secondary-sm">Editar</button>
                    <button className="btn-danger-sm">Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ← Asegurar que se exporta por defecto
