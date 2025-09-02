'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { LanguageCode } from '@/constants/languages'
import { Establishment } from '@/types/entities/establishment'

interface EstablishmentAdminDashboardProps {
  establishment: Establishment | null
  establishmentId: string
  languageCode: LanguageCode
}

export function EstablishmentAdminDashboard({
  establishment,
  establishmentId,
  languageCode,
}: EstablishmentAdminDashboardProps) {
  const { t } = useTranslation(languageCode)

  return (
    <div className="establishment-dashboard-content">
      {/* Contenido principal del dashboard */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">{t.establishmentAdmin.dashboard.overview}</h2>
        </div>

        {/* Estadísticas rápidas */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">Pedidos de Hoy</h3>
            <p className="dashboard-stat-value">24</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">Pedidos Activos</h3>
            <p className="dashboard-stat-value">8</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">Ingresos del Día</h3>
            <p className="dashboard-stat-value">€342.50</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">Empleados Activos</h3>
            <p className="dashboard-stat-value">6</p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="dashboard-quick-actions">
          <h3 className="dashboard-section-title">{t.establishmentAdmin.dashboard.quickActions}</h3>
          <div className="quick-actions-grid">
            {/* ✅ ACTUALIZADA: URL más corta sin "establishment" */}
            <a
              href={`/${languageCode}/admin/${establishmentId}/orders`}
              className="quick-action-card"
            >
              <h4>Ver Pedidos</h4>
              <p>Gestiona los pedidos en tiempo real</p>
            </a>
            {/* ✅ ACTUALIZADA: URL más corta sin "establishment" */}
            <a
              href={`/${languageCode}/admin/${establishmentId}/menu`}
              className="quick-action-card"
            >
              <h4>Gestionar Menú</h4>
              <p>Actualiza productos y precios</p>
            </a>
            {/* ✅ ACTUALIZADA: URL más corta sin "establishment" */}
            <a
              href={`/${languageCode}/admin/${establishmentId}/employees`}
              className="quick-action-card"
            >
              <h4>Equipo</h4>
              <p>Administra empleados y roles</p>
            </a>
          </div>
        </div>

        {/* Información del establecimiento */}
        <div className="establishment-info">
          <h3 className="dashboard-section-title">Información del Establecimiento</h3>
          <div className="establishment-details">
            <div className="establishment-detail-item">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{establishment?.name}</span>
            </div>
            <div className="establishment-detail-item">
              <span className="detail-label">Dirección:</span>
              <span className="detail-value">{establishment?.address}</span>
            </div>
            <div className="establishment-detail-item">
              <span className="detail-label">Estado:</span>
              <span
                className={`detail-value status ${establishment?.isActive ? 'active' : 'inactive'}`}
              >
                {establishment?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
