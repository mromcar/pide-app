export interface EstablishmentAdminPanelTranslations {
  title: string
  loading: string
  error: {
    title: string
    notFound: string
    failedToFetch: string
    unknownError: string
    goBack: string
  }
  actions: { signOut: string; accountData: string }
  accessDenied: { title: string; message: string }
  forms: {
    loading: string; retry: string; save: string; cancel: string
    edit: string; delete: string; update: string; create: string
    active: string; inactive: string
    required: string; optional: string
    translations: string
    notTranslated: string
    translationHint: string
    saving: string
  }
  messages: {
    error: { title: string; loadingFailed: string; verifyingPermissions: string }
    emptyStates: {
      noCategories: string; noCategoriesDesc: string; createFirstCategory: string
      noProducts: string; noProductsDesc: string; addFirstProduct: string
      noVariants: string; noVariantsDesc: string; addFirstVariant: string
      selectCategory: string; selectCategoryDesc: string
      selectProduct: string; selectProductDesc: string
      helperText: string
    }
  }
  navigation: { menuManagement: string; employeeManagement: string; orderSupervision: string }
  dashboard: {
    title: string; subtitle: string; overview: string; quickActions: string
    todaysOrders: string; activeOrders: string; dailyRevenue: string; activeEmployees: string
    viewOrders: string; viewOrdersDesc: string; manageMenu: string; manageMenuDesc: string
    manageTeam: string; manageTeamDesc: string; establishmentInfo: string
    name: string; address: string; city: string; phone: string; website: string
    status: string; acceptsOrders: string; createdAt: string; active: string; inactive: string
    yes: string; no: string; notAvailable: string; qrCode: string; qrCodeDesc: string
    menuUrl: string; copyUrl: string; previewMenu: string
  }
  menuManagement: {
    title: string; subtitle: string; loading: string
    categories: {
      title: string; addNew: string; edit: string; delete: string
      name: string; description: string; active: string; actions: string
      confirmDelete: string; deleteMessage: string; cancel: string; confirm: string
      update: string; create: string; order: string
    }
    products: {
      title: string; addNew: string; edit: string; delete: string
      name: string; description: string; price: string; category: string
      active: string; image: string; actions: string; variants: string; allergens: string
      confirmDelete: string; deleteMessage: string; allergensLabel: string
      noAllergens: string; variantNumber: string
    }
    variants: {
      title: string; addNew: string; edit: string; delete: string
      name: string; priceModifier: string; active: string; allProducts: string; product: string
      description: string; price: string; sku: string; saving: string
    }
  }
  employeeManagement: {
    title: string; subtitle: string; addEmployee: string; editEmployee: string; deleteEmployee: string
    name: string; email: string; role: string; active: string; actions: string
    roles: { waiter: string; cook: string; establishment_admin: string }
    confirmDelete: string; deleteMessage: string; inviteEmployee: string; sendInvitation: string
    loading: string; noEmployees: string; noEmployeesDescription: string; addFirstEmployee: string
  }
  orderSupervision: {
    title: string; subtitle: string
    filters: {
      all: string; pending: string; preparing: string; ready: string; delivered: string
      cancelled: string; date: string; status: string; allStatuses: string
    }
    refresh: string
    stats: { totalOrders: string; activeOrders: string; completedOrders: string }
    noOrdersInStatus: string
    markAs: string
    hideDetails: string
    orderDetails: {
      orderNumber: string; customer: string; table: string; status: string
      total: string; items: string; notes: string; timestamp: string
    }
    actions: { updateStatus: string; viewDetails: string; printOrder: string }
  }
  placeholders: {
    categories: { name: string }
    products: { name: string; description: string }
    variants: { description: string; price: string }
  }
  // NUEVO: pestañas dentro del drawer
  tabs?: { general: string; variants: string }
  // NUEVO: mensajes rápidos para toasts del panel
  notifications?: {
    categoryCreated: string; categoryUpdated: string; categoryDeleted: string
    categorySaveError: string; categoryUpdateError: string; categoryDeleteError: string
    categoryReordered: string; categoryReorderError: string
    productCreated: string; productUpdated: string; productDeleted: string
    productSaveError: string; productUpdateError: string; productDeleteError: string
    productReordered: string; productReorderError: string
    variantCreated: string; variantUpdated: string; variantDeleted: string
    variantSaveError: string; variantUpdateError: string; variantDeleteError: string
  }
}

export interface AdminModuleTranslations {
  dashboard: EstablishmentAdminPanelTranslations['dashboard']
  navigation: {
    dashboard: string
    menuManagement: string
    employeeManagement: string
    orderSupervision: string
    settings: string
    logout: string
  }
  menuManagement: EstablishmentAdminPanelTranslations['menuManagement']
  employeeManagement: EstablishmentAdminPanelTranslations['employeeManagement']
  orderSupervision: EstablishmentAdminPanelTranslations['orderSupervision']
  forms: {
    save: string; cancel: string; saving: string; loading: string; retry: string
    required: string; optional: string; active: string; inactive: string
    edit: string; delete: string; update: string; create: string
    translations: string
    notTranslated: string
    translationHint: string
  }
  placeholders: EstablishmentAdminPanelTranslations['placeholders']
  messages: {
    success: Record<string, string>
    error: {
      title: string
      categoryCreateFailed: string
      categoryUpdateFailed: string
      categoryDeleteFailed: string
      productCreateFailed: string
      productUpdateFailed: string
      productDeleteFailed: string
      variantCreateFailed: string
      variantUpdateFailed: string
      variantDeleteFailed: string
      employeeCreateFailed: string
      employeeUpdateFailed: string
      employeeDeleteFailed: string
      orderUpdateFailed: string
      loadingFailed: string
      verifyingPermissions: string
    }
    emptyStates: EstablishmentAdminPanelTranslations['messages']['emptyStates']
  }
  establishmentAdmin: EstablishmentAdminPanelTranslations
}
