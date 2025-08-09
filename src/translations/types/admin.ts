export interface EstablishmentAdminTranslations {
  dashboard: {
    title: string
    subtitle: string
    overview: string
    quickActions: string
  }
  navigation: {
    dashboard: string
    menuManagement: string
    employeeManagement: string
    orderSupervision: string
    settings: string
  }
  menuManagement: {
    title: string
    subtitle: string
    categories: {
      title: string
      addNew: string
      edit: string
      delete: string
      name: string
      description: string
      active: string
      actions: string
      confirmDelete: string
      deleteMessage: string
      cancel: string
      confirm: string
      update: string
      create: string
    }
    products: {
      title: string
      addNew: string
      edit: string
      delete: string
      name: string
      description: string
      price: string
      category: string
      active: string
      image: string
      actions: string
      variants: string
      allergens: string
      confirmDelete: string
      deleteMessage: string
    }
    variants: {
      title: string
      addNew: string
      edit: string
      delete: string
      name: string
      priceModifier: string
      active: string
      allProducts: string
      product: string
      description: string
      price: string
      sku: string
    }
  }
  employeeManagement: {
    title: string
    subtitle: string
    addEmployee: string
    editEmployee: string
    deleteEmployee: string
    name: string
    email: string
    role: string
    active: string
    actions: string
    roles: {
      waiter: string
      cook: string
      establishment_admin: string
    }
    confirmDelete: string
    deleteMessage: string
    inviteEmployee: string
    sendInvitation: string
  }
  orderSupervision: {
    title: string
    subtitle: string
    filters: {
      all: string
      pending: string
      preparing: string
      ready: string
      delivered: string
      cancelled: string
    }
    orderDetails: {
      orderNumber: string
      customer: string
      table: string
      status: string
      total: string
      items: string
      notes: string
      timestamp: string
    }
    actions: {
      updateStatus: string
      viewDetails: string
      printOrder: string
    }
  }
  forms: {
    save: string
    cancel: string
    saving: string
    loading: string
    required: string
    optional: string
    active: string
    inactive: string
    edit: string
    delete: string
    update: string
    create: string
  }
  messages: {
    success: {
      categoryCreated: string
      categoryUpdated: string
      categoryDeleted: string
      productCreated: string
      productUpdated: string
      productDeleted: string
      employeeCreated: string
      employeeUpdated: string
      employeeDeleted: string
      orderUpdated: string
    }
    error: {
      categoryCreateFailed: string
      categoryUpdateFailed: string
      categoryDeleteFailed: string
      productCreateFailed: string
      productUpdateFailed: string
      productDeleteFailed: string
      employeeCreateFailed: string
      employeeUpdateFailed: string
      employeeDeleteFailed: string
      orderUpdateFailed: string
      loadingFailed: string
    }
  }
}
