'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { LanguageCode } from '@/constants/languages'

interface EmployeeManagementProps {
  establishmentId: string
  languageCode?: LanguageCode
}

export default function EmployeeManagement({
  establishmentId,
  languageCode = 'es',
}: EmployeeManagementProps) {
  const { t } = useTranslation(languageCode)
  const [loading, setLoading] = useState(true)
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    // TODO: Implementar fetch de empleados
    console.log('🚧 EmployeeManagement: Loading employees for establishment:', establishmentId)

    // Simular carga
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [establishmentId])

  if (loading) {
    return (
      <div className="employee-management-loading">
        <div className="loading-spinner"></div>
        <p>{t.establishmentAdmin.employeeManagement.loading || 'Cargando empleados...'}</p>
      </div>
    )
  }

  return (
    <div className="employee-management-container">
      <div className="employee-management-header">
        <h1 className="employee-management-title">
          {t.establishmentAdmin.employeeManagement.title || 'Gestión de Empleados'}
        </h1>

        <button className="btn-primary">
          {t.establishmentAdmin.employeeManagement.addEmployee || 'Agregar Empleado'}
        </button>
      </div>

      <div className="employee-management-content">
        {employees.length === 0 ? (
          <div className="employee-management-empty">
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3 className="empty-state-title">
                {t.establishmentAdmin.employeeManagement.noEmployees || 'No hay empleados'}
              </h3>
              <p className="empty-state-description">
                {t.establishmentAdmin.employeeManagement.noEmployeesDescription ||
                  'Agrega empleados para gestionar los permisos y roles de tu establecimiento.'}
              </p>
              <button className="btn-primary">
                {t.establishmentAdmin.employeeManagement.addFirstEmployee ||
                  'Agregar Primer Empleado'}
              </button>
            </div>
          </div>
        ) : (
          <div className="employee-management-list">
            {/* TODO: Lista de empleados */}
            <p>Lista de empleados aquí...</p>
          </div>
        )}
      </div>

      {/* TODO: Modal para agregar/editar empleados */}
    </div>
  )
}
