export interface EstablishmentAdminTranslations {
  dashboard: {
    title: string
    subtitle: string
    overview: string
    quickActions: string
    todaysOrders: string
    activeOrders: string
    dailyRevenue: string
    activeEmployees: string
    viewOrders: string
    viewOrdersDesc: string
    manageMenu: string
    manageMenuDesc: string
    manageTeam: string
    manageTeamDesc: string
    establishmentInfo: string
    name: string
    address: string
    city: string
    phone: string
    website: string
    status: string
    acceptsOrders: string
    createdAt: string
    active: string
    inactive: string
    yes: string
    no: string
    notAvailable: string
    qrCode: string
    qrCodeDesc: string
    menuUrl: string
    copyUrl: string
    previewMenu: string
  }
  navigation: {
    dashboard: string
    menuManagement: string
    employeeManagement: string
    orderSupervision: string
    settings: string
    logout: string
  }
  menuManagement: {
    title: string
    subtitle: string
    loading: string
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
      order: string
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
      allergensLabel: string
      noAllergens: string
      variantNumber: string
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
      saving: string
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
    loading: string
    noEmployees: string
    noEmployeesDescription: string
    addFirstEmployee: string
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
      date: string
      status: string
      allStatuses: string
    }
    refresh: string
    stats: {
      totalOrders: string
      activeOrders: string
      completedOrders: string
    }
    noOrdersInStatus: string
    markAs: string
    hideDetails: string
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
    retry: string
    required: string
    optional: string
    active: string
    inactive: string
    edit: string
    delete: string
    update: string
    create: string
  }
  placeholders: {
    categories: {
      name: string
    }
    products: {
      name: string
      description: string
    }
    variants: {
      description: string
      price: string
    }
  }
  helpTexts: {
    variants: {
      inactiveNotVisible: string
    }
  }
  messages: {
    success: {
      categoryCreated: string
      categoryUpdated: string
      categoryDeleted: string
      productCreated: string
      productUpdated: string
      productDeleted: string
      variantCreated: string
      variantUpdated: string
      variantDeleted: string
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
      variantCreateFailed: string
      variantUpdateFailed: string
      variantDeleteFailed: string
      employeeCreateFailed: string
      employeeUpdateFailed: string
      employeeDeleteFailed: string
      orderUpdateFailed: string
      loadingFailed: string
    }
    emptyStates: {
      noCategories: string
      noCategoriesDesc: string
      createFirstCategory: string
      noProducts: string
      noProductsDesc: string
      addFirstProduct: string
      noVariants: string
      noVariantsDesc: string
      addFirstVariant: string
      selectCategory: string
      selectCategoryDesc: string
      selectProduct: string
      selectProductDesc: string
      helperText: string
    }
  }
  establishment: {
    title: string
    loading: string
    error: {
      title: string
      failedToFetch: string
      unknownError: string
      goBack: string
    }
    actions: {
      signOut: string
      accountData: string
    }
    accessDenied: {
      title: string
      message: string
    }
  }
}
