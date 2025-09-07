'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { LanguageCode } from '@/constants/languages'
import { EstablishmentResponseDTO } from '@/types/dtos/establishment'
import Link from 'next/link'

interface EstablishmentAdminDashboardProps {
  establishment: EstablishmentResponseDTO | null
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
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">{t.establishmentAdmin.dashboard.overview}</h2>
        </div>

        {/* ✅ Estadísticas rápidas - TRADUCIDAS */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">{t.establishmentAdmin.dashboard.todaysOrders}</h3>
            <p className="dashboard-stat-value">24</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">{t.establishmentAdmin.dashboard.activeOrders}</h3>
            <p className="dashboard-stat-value">8</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">{t.establishmentAdmin.dashboard.dailyRevenue}</h3>
            <p className="dashboard-stat-value">€342.50</p>
          </div>
          <div className="dashboard-stat-card">
            <h3 className="dashboard-stat-title">
              {t.establishmentAdmin.dashboard.activeEmployees}
            </h3>
            <p className="dashboard-stat-value">6</p>
          </div>
        </div>

        {/* ✅ Acciones rápidas - TRADUCIDAS */}
        <div className="dashboard-quick-actions">
          <h3 className="dashboard-section-title">{t.establishmentAdmin.dashboard.quickActions}</h3>
          <div className="quick-actions-grid">
            <Link
              href={`/${languageCode}/admin/${establishmentId}/orders`}
              className="quick-action-card"
            >
              <h4>{t.establishmentAdmin.dashboard.viewOrders}</h4>
              <p>{t.establishmentAdmin.dashboard.viewOrdersDesc}</p>
            </Link>
            <Link
              href={`/${languageCode}/admin/${establishmentId}/menu`}
              className="quick-action-card"
            >
              <h4>{t.establishmentAdmin.dashboard.manageMenu}</h4>
              <p>{t.establishmentAdmin.dashboard.manageMenuDesc}</p>
            </Link>
            <Link
              href={`/${languageCode}/admin/${establishmentId}/employees`}
              className="quick-action-card"
            >
              <h4>{t.establishmentAdmin.dashboard.manageTeam}</h4>
              <p>{t.establishmentAdmin.dashboard.manageTeamDesc}</p>
            </Link>
          </div>
        </div>

        {/* ✅ Información del establecimiento - TRADUCIDA */}
        <div className="establishment-info">
          <h3 className="dashboard-section-title">
            {t.establishmentAdmin.dashboard.establishmentInfo}
          </h3>
          <div className="establishment-details">
            <div className="establishment-detail-item">
              <span className="detail-label">{t.establishmentAdmin.dashboard.name}:</span>
              <span className="detail-value">
                {establishment?.name || t.establishmentAdmin.dashboard.notAvailable}
              </span>
            </div>
            <div className="establishment-detail-item">
              <span className="detail-label">{t.establishmentAdmin.dashboard.address}:</span>
              <span className="detail-value">
                {establishment?.address || t.establishmentAdmin.dashboard.notAvailable}
              </span>
            </div>
            {establishment?.city && (
              <div className="establishment-detail-item">
                <span className="detail-label">{t.establishmentAdmin.dashboard.city}:</span>
                <span className="detail-value">{establishment.city}</span>
              </div>
            )}
            {establishment?.phone1 && (
              <div className="establishment-detail-item">
                <span className="detail-label">{t.establishmentAdmin.dashboard.phone}:</span>
                <span className="detail-value">{establishment.phone1}</span>
              </div>
            )}
            {establishment?.website && (
              <div className="establishment-detail-item">
                <span className="detail-label">{t.establishmentAdmin.dashboard.website}:</span>
                <a
                  href={establishment.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-value website-link"
                >
                  {establishment.website}
                </a>
              </div>
            )}
            <div className="establishment-detail-item">
              <span className="detail-label">{t.establishmentAdmin.dashboard.status}:</span>
              <span
                className={`detail-value status ${establishment?.isActive ? 'active' : 'inactive'}`}
              >
                {establishment?.isActive
                  ? t.establishmentAdmin.dashboard.active
                  : t.establishmentAdmin.dashboard.inactive}
              </span>
            </div>
            <div className="establishment-detail-item">
              <span className="detail-label">{t.establishmentAdmin.dashboard.acceptsOrders}:</span>
              <span
                className={`detail-value status ${establishment?.acceptsOrders ? 'active' : 'inactive'}`}
              >
                {establishment?.acceptsOrders
                  ? t.establishmentAdmin.dashboard.yes
                  : t.establishmentAdmin.dashboard.no}
              </span>
            </div>
            {establishment?.createdAt && (
              <div className="establishment-detail-item">
                <span className="detail-label">{t.establishmentAdmin.dashboard.createdAt}:</span>
                <span className="detail-value">
                  {new Date(establishment.createdAt).toLocaleDateString(languageCode)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ QR Code Section - TRADUCIDA */}
        <div className="qr-code-section">
          <h3 className="dashboard-section-title">{t.establishmentAdmin.dashboard.qrCode}</h3>
          <div className="qr-code-content">
            <div className="qr-code-info">
              <p>{t.establishmentAdmin.dashboard.qrCodeDesc}</p>
              <div className="qr-code-url">
                <span className="detail-label">{t.establishmentAdmin.dashboard.menuUrl}:</span>
                <code className="menu-url">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/${languageCode}/menu/${establishmentId}`
                    : `[domain]/${languageCode}/menu/${establishmentId}`}
                </code>
              </div>
            </div>
            <div className="qr-code-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const url = `${window.location.origin}/${languageCode}/menu/${establishmentId}`
                  navigator.clipboard.writeText(url)
                }}
              >
                {t.establishmentAdmin.dashboard.copyUrl}
              </button>
              <Link
                href={`/${languageCode}/menu/${establishmentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {t.establishmentAdmin.dashboard.previewMenu}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
