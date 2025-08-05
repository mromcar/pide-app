'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import type { User } from '@/types/entities/user'
import { UserRole as PrismaUserRole } from '@prisma/client'
import type { LanguageCode } from '@/constants/languages'
import type { UITranslation } from '@/translations'

// Define allowed employee roles (exclude 'client')
type EmployeeRole = Exclude<PrismaUserRole, 'client'>

// Update the form data interface
interface EmployeeFormData {
  name: string
  email: string
  role: EmployeeRole // Use EmployeeRole instead of UserRole
  active: boolean
  password?: string
  establishmentId?: string
}

interface EmployeeManagementProps {
  establishmentId: string
  language: LanguageCode
}

export function EmployeeManagement({ establishmentId, language }: EmployeeManagementProps) {
  const { t } = useTranslation(language)
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<EmployeeRole | 'all'>('all') // Fix: Use EmployeeRole instead of UserRole

  useEffect(() => {
    fetchEmployees()
  }, [establishmentId])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/establishments/${establishmentId}/employees`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setShowForm(true)
  }

  const handleEditEmployee = (employee: User) => {
    setEditingEmployee(employee)
    setShowForm(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/users/${employeeId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await fetchEmployees()
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  // Corregir la función handleSubmit con tipo específico
  const handleFormSubmit = async (formData: EmployeeFormData) => {
    try {
      const url = editingEmployee 
        ? `/api/users/${editingEmployee.user_id}` // Use user_id instead of id
        : `/api/establishments/${establishmentId}/employees`
      
      const method = editingEmployee ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          establishmentId
        })
      })
      
      if (response.ok) {
        await fetchEmployees()
        setShowForm(false)
        setEditingEmployee(null)
      }
    } catch (error) {
      console.error('Error saving employee:', error)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="employee-management">
      {/* Header */}
      <div className="management-header">
        <h2 className="management-title">
          {t.establishmentAdmin.employeeManagement.title}
        </h2>
        <button 
          onClick={handleAddEmployee}
          className="btn-primary"
        >
          {t.establishmentAdmin.employeeManagement.addEmployee}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as EmployeeRole | 'all')} // Use EmployeeRole
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="waiter">{t.establishmentAdmin.employeeManagement.roles.waiter}</option>
          <option value="cook">{t.establishmentAdmin.employeeManagement.roles.cook}</option>
          <option value="establishment_admin">{t.establishmentAdmin.employeeManagement.roles.establishment_admin}</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>{t.establishmentAdmin.employeeManagement.name}</th>
              <th>{t.establishmentAdmin.employeeManagement.email}</th>
              <th>{t.establishmentAdmin.employeeManagement.role}</th>
              <th>{t.establishmentAdmin.employeeManagement.active}</th>
              <th>{t.establishmentAdmin.employeeManagement.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.user_id}> {/* Use user_id instead of id */}
                <td>{employee.name || '-'}</td>
                <td>{employee.email}</td>
                <td>
                  <span className="role-badge">
                    {t.establishmentAdmin.employeeManagement.roles[employee.role]}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${
                    employee.active ? 'active' : 'inactive'
                  }`}>
                    {employee.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleEditEmployee(employee)}
                      className="btn-secondary btn-sm"
                    >
                      {t.establishmentAdmin.employeeManagement.editEmployee}
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(employee.user_id.toString())}
                      className="btn-danger btn-sm"
                    >
                      {t.establishmentAdmin.employeeManagement.deleteEmployee}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredEmployees.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3 className="empty-state-title">No employees found</h3>
            <p className="empty-state-description">
              {searchTerm || roleFilter !== 'all' 
                ? 'No employees match your search criteria'
                : 'Start by adding your first employee'
              }
            </p>
            {!searchTerm && roleFilter === 'all' && (
              <button onClick={handleAddEmployee} className="btn-primary">
                {t.establishmentAdmin.employeeManagement.addEmployee}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        // Corregir el JSX
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleFormSubmit} // Corregido: usar handleFormSubmit
          onCancel={() => setEditingEmployee(null)}
          t={t}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {t.establishmentAdmin.employeeManagement.confirmDelete}
              </h3>
            </div>
            <div className="modal-body">
              <p>{t.establishmentAdmin.employeeManagement.deleteMessage}</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteEmployee(deleteConfirm)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Employee Form Component
interface EmployeeFormProps {
  employee: User | null
  onSubmit: (data: EmployeeFormData) => void
  onCancel: () => void
  t: UITranslation
}

// Update the EmployeeForm component
function EmployeeForm({ employee, onSubmit, onCancel, t }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: employee?.name || '',
    email: employee?.email || '',
    role: (employee?.role as EmployeeRole) || 'waiter', // Cast to EmployeeRole and ensure it's not 'client'
    active: employee?.active ?? true,
    password: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = { ...formData }
    if (employee && !submitData.password) {
      delete submitData.password // Don't update password if not provided
    }
    onSubmit(submitData)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h3 className="modal-title">
            {employee 
              ? t.establishmentAdmin.employeeManagement.editEmployee
              : t.establishmentAdmin.employeeManagement.addEmployee
            }
          </h3>
          <button onClick={onCancel} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {t.establishmentAdmin.employeeManagement.name}
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                {t.establishmentAdmin.employeeManagement.email}
              </label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {t.establishmentAdmin.employeeManagement.role}
              </label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                required
              >
                <option value="waiter">{t.establishmentAdmin.employeeManagement.roles.waiter}</option>
                <option value="cook">{t.establishmentAdmin.employeeManagement.roles.cook}</option>
                <option value="establishment_admin">{t.establishmentAdmin.employeeManagement.roles.establishment_admin}</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Password {employee && '(leave empty to keep current)'}
              </label>
              <input
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!employee}
                minLength={8}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2"
              />
              {t.establishmentAdmin.employeeManagement.active}
            </label>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}