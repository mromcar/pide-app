import type { EstablishmentAdminTranslations } from '../../types/admin'

export const adminEn: EstablishmentAdminTranslations = {
  dashboard: {
    title: 'Establishment Dashboard',
    subtitle: 'Manage your restaurant operations',
    overview: 'Overview',
    quickActions: 'Quick Actions'
  },
  navigation: {
    dashboard: 'Dashboard',
    menuManagement: 'Menu Management',
    employeeManagement: 'Employee Management',
    orderSupervision: 'Order Supervision',
    settings: 'Settings'
  },
  menuManagement: {
    title: 'Menu Management',
    subtitle: 'Manage categories, products and variants',
    categories: {
      title: 'Categories',
      addNew: 'Add New Category',
      edit: 'Edit Category',
      delete: 'Delete Category',
      name: 'Name',
      description: 'Description',
      active: 'Active',
      actions: 'Actions',
      confirmDelete: 'Confirm Deletion',
      deleteMessage: 'Are you sure you want to delete this category?',
      cancel: 'Cancel',
      confirm: 'Confirm',
      update: 'Update Category',
      create: 'Create Category'
    },
    products: {
      title: 'Products',
      addNew: 'Add New Product',
      edit: 'Edit Product',
      delete: 'Delete Product',
      name: 'Name',
      description: 'Description',
      price: 'Price',
      category: 'Category',
      active: 'Active',
      image: 'Image',
      actions: 'Actions',
      variants: 'Variants',
      allergens: 'Allergens',
      confirmDelete: 'Confirm Deletion',
      deleteMessage: 'Are you sure you want to delete this product?'
    },
    variants: {
      title: 'Variants',
      addNew: 'Add New Variant',
      edit: 'Edit Variant',
      delete: 'Delete Variant',
      name: 'Name',
      priceModifier: 'Price Modifier',
      active: 'Active',
      allProducts: 'All Products',
      product: 'Product',
      description: 'Description',
      price: 'Price',
      sku: 'SKU'
    }
  },
  employeeManagement: {
    title: 'Employee Management',
    subtitle: 'Manage your restaurant staff',
    addEmployee: 'Add Employee',
    editEmployee: 'Edit Employee',
    deleteEmployee: 'Delete Employee',
    name: 'Name',
    email: 'Email',
    role: 'Role',
    active: 'Active',
    actions: 'Actions',
    roles: {
      waiter: 'Waiter',
      cook: 'Cook',
      establishment_admin: 'Administrator'
    },
    confirmDelete: 'Confirm Deletion',
    deleteMessage: 'Are you sure you want to delete this employee?',
    inviteEmployee: 'Invite Employee',
    sendInvitation: 'Send Invitation'
  },
  orderSupervision: {
    title: 'Order Supervision',
    subtitle: 'Monitor and manage all orders',
    filters: {
      all: 'All Orders',
      pending: 'Pending',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    },
    orderDetails: {
      orderNumber: 'Order #',
      customer: 'Customer',
      table: 'Table',
      status: 'Status',
      total: 'Total',
      items: 'Items',
      notes: 'Notes',
      timestamp: 'Time'
    },
    actions: {
      updateStatus: 'Update Status',
      viewDetails: 'View Details',
      printOrder: 'Print Order'
    }
  },
  forms: {
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    required: 'Required',
    optional: 'Optional',
    active: 'Active',
    inactive: 'Inactive',
    edit: 'Edit',
    delete: 'Delete',
    update: 'Update',
    create: 'Create'
  },
  messages: {
    success: {
      categoryCreated: 'Category created successfully',
      categoryUpdated: 'Category updated successfully',
      categoryDeleted: 'Category deleted successfully',
      productCreated: 'Product created successfully',
      productUpdated: 'Product updated successfully',
      productDeleted: 'Product deleted successfully',
      employeeCreated: 'Employee created successfully',
      employeeUpdated: 'Employee updated successfully',
      employeeDeleted: 'Employee deleted successfully',
      orderUpdated: 'Order updated successfully'
    },
    error: {
      categoryCreateFailed: 'Failed to create category',
      categoryUpdateFailed: 'Failed to update category',
      categoryDeleteFailed: 'Failed to delete category',
      productCreateFailed: 'Failed to create product',
      productUpdateFailed: 'Failed to update product',
      productDeleteFailed: 'Failed to delete product',
      employeeCreateFailed: 'Failed to create employee',
      employeeUpdateFailed: 'Failed to update employee',
      employeeDeleteFailed: 'Failed to delete employee',
      orderUpdateFailed: 'Failed to update order',
      loadingFailed: 'Failed to load data'
    }
  }
}
