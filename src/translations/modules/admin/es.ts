import type { EstablishmentAdminTranslations } from '../../types/admin'

export const adminEs: EstablishmentAdminTranslations = {
  dashboard: {
    title: 'Panel del Establecimiento',
    subtitle: 'Gestiona las operaciones de tu restaurante',
    overview: 'Resumen',
    quickActions: 'Acciones Rápidas'
  },
  navigation: {
    dashboard: 'Panel',
    menuManagement: 'Gestión del Menú',
    employeeManagement: 'Gestión de Empleados',
    orderSupervision: 'Supervisión de Pedidos',
    settings: 'Configuración',
    logout: 'Cerrar sesión'
  },
  menuManagement: {
    title: 'Gestión del Menú',
    subtitle: 'Gestiona categorías, productos y variantes',
    categories: {
      title: 'Categorías',
      addNew: 'Añadir Nueva Categoría',
      edit: 'Editar Categoría',
      delete: 'Eliminar Categoría',
      name: 'Nombre',
      description: 'Descripción',
      active: 'Activo',
      actions: 'Acciones',
      confirmDelete: 'Confirmar Eliminación',
      deleteMessage: '¿Estás seguro de que quieres eliminar esta categoría?',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      update: 'Actualizar Categoría',
      create: 'Crear Categoría',
      order: 'Orden'
    },
    products: {
      title: 'Productos',
      addNew: 'Añadir Nuevo Producto',
      edit: 'Editar Producto',
      delete: 'Eliminar Producto',
      name: 'Nombre',
      description: 'Descripción',
      price: 'Precio',
      category: 'Categoría',
      active: 'Activo',
      image: 'Imagen',
      actions: 'Acciones',
      variants: 'Variantes',
      allergens: 'Alérgenos',
      confirmDelete: 'Confirmar Eliminación',
      deleteMessage: '¿Estás seguro de que quieres eliminar este producto?',
      allergensLabel: 'Alérgenos:',
      noAllergens: 'Ninguno',
      variantNumber: 'Variante'
    },
    variants: {
      title: 'Variantes',
      addNew: 'Añadir Nueva Variante',
      edit: 'Editar Variante',
      delete: 'Eliminar Variante',
      name: 'Nombre',
      priceModifier: 'Modificador de Precio',
      active: 'Activo',
      allProducts: 'Todos los productos',
      product: 'Producto',
      description: 'Descripción',
      price: 'Precio (€)',
      sku: 'SKU',
      saving: 'Guardando...'
    }
  },
  employeeManagement: {
    title: 'Gestión de Empleados',
    subtitle: 'Gestiona el personal de tu restaurante',
    addEmployee: 'Añadir Empleado',
    editEmployee: 'Editar Empleado',
    deleteEmployee: 'Eliminar Empleado',
    name: 'Nombre',
    email: 'Email',
    role: 'Rol',
    active: 'Activo',
    actions: 'Acciones',
    roles: {
      waiter: 'Camarero',
      cook: 'Cocinero',
      establishment_admin: 'Administrador'
    },
    confirmDelete: 'Confirmar Eliminación',
    deleteMessage: '¿Estás seguro de que quieres eliminar este empleado?',
    inviteEmployee: 'Invitar Empleado',
    sendInvitation: 'Enviar Invitación'
  },
  orderSupervision: {
    title: 'Supervisión de pedidos',
    subtitle: 'Supervisa y gestiona los pedidos',
    filters: {
      all: 'Todos los Pedidos',
      pending: 'Pendientes',
      preparing: 'Preparando',
      ready: 'Listos',
      delivered: 'Entregados',
      cancelled: 'Cancelados',
      date: 'Fecha',
      status: 'Estado',
      allStatuses: 'Todos los estados'
    },
    refresh: 'Actualizar',
    stats: {
      totalOrders: 'Pedidos totales',
      activeOrders: 'Pedidos activos',
      completedOrders: 'Pedidos completados'
    },
    noOrdersInStatus: 'No hay pedidos en este estado',
    markAs: 'Marcar como',
    hideDetails: 'Ocultar detalles',
    orderDetails: {
      orderNumber: 'Pedido #',
      customer: 'Cliente',
      table: 'Mesa',
      status: 'Estado',
      total: 'Total',
      items: 'Artículos',
      notes: 'Notas',
      timestamp: 'Hora'
    },
    actions: {
      updateStatus: 'Actualizar Estado',
      viewDetails: 'Ver Detalles',
      printOrder: 'Imprimir Pedido'
    }
  },
  forms: {
    save: 'Guardar',
    cancel: 'Cancelar',
    saving: 'Guardando...',
    loading: 'Cargando...',
    required: 'Requerido',
    optional: 'Opcional',
    active: 'Activo',
    inactive: 'Inactivo',
    edit: 'Editar',
    delete: 'Eliminar',
    update: 'Actualizar',
    create: 'Crear'
  },
  placeholders: { // 👈 Nueva sección
    categories: {
      name: 'Ej: Entrantes, Platos principales, Postres...'
    },
    products: {
      name: 'Ej: Paella Valenciana, Gazpacho Andaluz...',
      description: 'Describe tu producto aquí...'
    },
    variants: {
      description: 'Ej: Ración normal, Media ración, Pequeña...',
      price: '0.00'
    }
  },
  helpTexts: { // 👈 Nueva sección
    variants: {
      inactiveNotVisible: 'Las variantes inactivas no aparecerán en el menú público'
    }
  },
  messages: {
    success: {
      categoryCreated: 'Categoría creada exitosamente',
      categoryUpdated: 'Categoría actualizada exitosamente',
      categoryDeleted: 'Categoría eliminada exitosamente',
      productCreated: 'Producto creado exitosamente',
      productUpdated: 'Producto actualizado exitosamente',
      productDeleted: 'Producto eliminado exitosamente',
      variantCreated: 'Variante creada exitosamente',
      variantUpdated: 'Variante actualizada exitosamente',
      variantDeleted: 'Variante eliminada exitosamente',
      employeeCreated: 'Empleado creado exitosamente',
      employeeUpdated: 'Empleado actualizado exitosamente',
      employeeDeleted: 'Empleado eliminado exitosamente',
      orderUpdated: 'Pedido actualizado exitosamente'
    },
    error: {
      categoryCreateFailed: 'Error al crear la categoría',
      categoryUpdateFailed: 'Error al actualizar la categoría',
      categoryDeleteFailed: 'Error al eliminar la categoría',
      productCreateFailed: 'Error al crear el producto',
      productUpdateFailed: 'Error al actualizar el producto',
      productDeleteFailed: 'Error al eliminar el producto',
      variantCreateFailed: 'Error al crear la variante',
      variantUpdateFailed: 'Error al actualizar la variante',
      variantDeleteFailed: 'Error al eliminar la variante',
      employeeCreateFailed: 'Error al crear el empleado',
      employeeUpdateFailed: 'Error al actualizar el empleado',
      employeeDeleteFailed: 'Error al eliminar el empleado',
      orderUpdateFailed: 'Error al actualizar el pedido',
      loadingFailed: 'Error al cargar los datos'
    },
    emptyStates: {
      noCategories: 'No hay categorías disponibles',
      noCategoriesDesc: 'Para gestionar productos, primero necesitas crear al menos una categoría.',
      createFirstCategory: 'Crear primera categoría',
      noProducts: 'No hay productos en esta categoría',
      noProductsDesc: 'Añade tu primer producto para comenzar a construir tu menú.',
      addFirstProduct: 'Añadir primer producto',
      noVariants: 'No hay variantes',
      noVariantsDesc: 'Añade variantes para ofrecer diferentes opciones de este producto.',
      addFirstVariant: 'Añadir primera variante',
      selectCategory: 'Selecciona una categoría',
      selectCategoryDesc: 'Elige una categoría de la barra lateral para ver y gestionar sus productos.',
      selectProduct: 'Selecciona un producto',
      selectProductDesc: 'Elige un producto para gestionar sus variantes.',
      helperText: '💡 Ve a la pestaña "Categorías" para crear tu primera categoría'
    }
  },
  establishment: {
    title: 'Administración del Establecimiento',
    loading: 'Cargando datos del establecimiento...',
    error: {
      title: 'Error',
      failedToFetch: 'Error al cargar los datos del establecimiento',
      unknownError: 'Ha ocurrido un error desconocido',
      goBack: 'Volver'
    },
    actions: {
      signOut: 'Cerrar Sesión',
      accountData: 'Datos de cuenta'
    },
    accessDenied: {
      title: 'Acceso Denegado',
      message: 'No tienes permisos para acceder a esta página'
    }
  }
}
