import type { EstablishmentAdminTranslations } from '../../types/admin'

export const adminFr: EstablishmentAdminTranslations = {
  dashboard: {
    title: 'Tableau de Bord de l\'Établissement',
    subtitle: 'Gérez les opérations de votre restaurant',
    overview: 'Aperçu',
    quickActions: 'Actions Rapides'
  },
  navigation: {
    dashboard: 'Tableau de Bord',
    menuManagement: 'Gestion du Menu',
    employeeManagement: 'Gestion des Employés',
    orderSupervision: 'Supervision des Commandes',
    settings: 'Paramètres',
    logout: 'Déconnexion'
  },
  menuManagement: {
    title: 'Gestion du Menu',
    subtitle: 'Gérez les catégories, produits et variantes',
    categories: {
      title: 'Catégories',
      addNew: 'Ajouter Nouvelle Catégorie',
      edit: 'Modifier Catégorie',
      delete: 'Supprimer Catégorie',
      name: 'Nom',
      description: 'Description',
      active: 'Actif',
      actions: 'Actions',
      confirmDelete: 'Confirmer la Suppression',
      deleteMessage: 'Êtes-vous sûr de vouloir supprimer cette catégorie?',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      update: 'Mettre à Jour la Catégorie',
      create: 'Créer la Catégorie',
      order: 'Ordre'
    },
    products: {
      title: 'Produits',
      addNew: 'Ajouter Nouveau Produit',
      edit: 'Modifier Produit',
      delete: 'Supprimer Produit',
      name: 'Nom',
      description: 'Description',
      price: 'Prix',
      category: 'Catégorie',
      active: 'Actif',
      image: 'Image',
      actions: 'Actions',
      variants: 'Variantes',
      allergens: 'Allergènes',
      confirmDelete: 'Confirmer la Suppression',
      deleteMessage: 'Êtes-vous sûr de vouloir supprimer ce produit?',
      allergensLabel: 'Allergènes:',
      noAllergens: 'Aucun',
      variantNumber: 'Variante'
    },
    variants: {
      title: 'Variantes',
      addNew: 'Ajouter Nouvelle Variante',
      edit: 'Modifier Variante',
      delete: 'Supprimer Variante',
      name: 'Nom',
      priceModifier: 'Modificateur de Prix',
      active: 'Actif',
      allProducts: 'Tous les produits',
      product: 'Produit',
      description: 'Description',
      price: 'Prix (€)',
      sku: 'SKU',
      saving: 'Enregistrement...'
    }
  },
  employeeManagement: {
    title: 'Gestion des Employés',
    subtitle: 'Gérez le personnel de votre restaurant',
    addEmployee: 'Ajouter Employé',
    editEmployee: 'Modifier Employé',
    deleteEmployee: 'Supprimer Employé',
    name: 'Nom',
    email: 'Email',
    role: 'Rôle',
    active: 'Actif',
    actions: 'Actions',
    roles: {
      waiter: 'Serveur',
      cook: 'Cuisinier',
      establishment_admin: 'Administrateur'
    },
    confirmDelete: 'Confirmer la Suppression',
    deleteMessage: 'Êtes-vous sûr de vouloir supprimer cet employé?',
    inviteEmployee: 'Inviter Employé',
    sendInvitation: 'Envoyer Invitation'
  },
  orderSupervision: {
    title: 'Supervision des commandes',
    subtitle: 'Surveillez et gérez toutes les commandes',
    filters: {
      all: 'Toutes les Commandes',
      pending: 'En Attente',
      preparing: 'En Préparation',
      ready: 'Prêtes',
      delivered: 'Livrées',
      cancelled: 'Annulées',
      date: 'Date',
      status: 'Statut',
      allStatuses: 'Tous les statuts'
    },
    refresh: 'Rafraîchir',
    stats: {
      totalOrders: 'Commandes totales',
      activeOrders: 'Commandes actives',
      completedOrders: 'Commandes terminées'
    },
    noOrdersInStatus: 'Aucune commande dans ce statut',
    markAs: 'Marquer comme',
    hideDetails: 'Masquer les détails',
    orderDetails: {
      orderNumber: 'Commande #',
      customer: 'Client',
      table: 'Table',
      status: 'Statut',
      total: 'Total',
      items: 'Articles',
      notes: 'Notes',
      timestamp: 'Heure'
    },
    actions: {
      updateStatus: 'Mettre à Jour le Statut',
      viewDetails: 'Voir Détails',
      printOrder: 'Imprimer Commande'
    }
  },
  forms: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    saving: 'Enregistrement...',
    loading: 'Chargement...',
    required: 'Requis',
    optional: 'Optionnel',
    active: 'Actif',
    inactive: 'Inactif',
    edit: 'Modifier',
    delete: 'Supprimer',
    update: 'Mettre à jour',
    create: 'Créer'
  },
  messages: {
    success: {
      categoryCreated: 'Catégorie créée avec succès',
      categoryUpdated: 'Catégorie mise à jour avec succès',
      categoryDeleted: 'Catégorie supprimée avec succès',
      productCreated: 'Produit créé avec succès',
      productUpdated: 'Produit mis à jour avec succès',
      productDeleted: 'Produit supprimé avec succès',
      variantCreated: 'Variante créée avec succès',
      variantUpdated: 'Variante mise à jour avec succès',
      variantDeleted: 'Variante supprimée avec succès',
      employeeCreated: 'Employé créé avec succès',
      employeeUpdated: 'Employé mis à jour avec succès',
      employeeDeleted: 'Employé supprimé avec succès',
      orderUpdated: 'Commande mise à jour avec succès'
    },
    error: {
      categoryCreateFailed: 'Échec de la création de la catégorie',
      categoryUpdateFailed: 'Échec de la mise à jour de la catégorie',
      categoryDeleteFailed: 'Échec de la suppression de la catégorie',
      productCreateFailed: 'Échec de la création du produit',
      productUpdateFailed: 'Échec de la mise à jour du produit',
      productDeleteFailed: 'Échec de la suppression du produit',
      variantCreateFailed: 'Échec de la création de la variante',
      variantUpdateFailed: 'Échec de la mise à jour de la variante',
      variantDeleteFailed: 'Échec de la suppression de la variante',
      employeeCreateFailed: 'Échec de la création de l\'employé',
      employeeUpdateFailed: 'Échec de la mise à jour de l\'employé',
      employeeDeleteFailed: 'Échec de la suppression de l\'employé',
      orderUpdateFailed: 'Échec de la mise à jour de la commande',
      loadingFailed: 'Échec du chargement des données'
    },
    emptyStates: {
      noCategories: 'Aucune catégorie disponible',
      noCategoriesDesc: 'Pour gérer des produits, vous devez d\'abord créer au moins une catégorie.',
      createFirstCategory: 'Créer la première catégorie',
      noProducts: 'Aucun produit dans cette catégorie',
      noProductsDesc: 'Ajoutez votre premier produit pour commencer à construire votre menu.',
      addFirstProduct: 'Ajouter le premier produit',
      noVariants: 'Aucune variante',
      noVariantsDesc: 'Ajoutez des variantes pour offrir différentes options pour ce produit.',
      addFirstVariant: 'Ajouter la première variante',
      selectCategory: 'Sélectionnez une catégorie',
      selectCategoryDesc: 'Choisissez une catégorie dans la barre latérale pour voir et gérer ses produits.',
      selectProduct: 'Sélectionnez un produit',
      selectProductDesc: 'Choisissez un produit pour gérer ses variantes.',
      helperText: '💡 Allez à l\'onglet "Catégories" pour créer votre première catégorie'
    }
  },
  establishment: {
    title: 'Administration de l\'Établissement',
    loading: 'Chargement des données de l\'établissement...',
    error: {
      title: 'Erreur',
      failedToFetch: 'Échec du chargement des données de l\'établissement',
      unknownError: 'Une erreur inconnue s\'est produite',
      goBack: 'Retour'
    },
    actions: {
      signOut: 'Se Déconnecter',
      accountData: 'Données de Compte'
    },
    accessDenied: {
      title: 'Accès Refusé',
      message: 'Vous n\'avez pas la permission d\'accéder à cette page'
    }
  },
  placeholders: {
    categories: {
      name: 'Ex: Entrées, Plats principaux, Desserts...'
    },
    products: {
      name: 'Ex: Paella Valencienne, Gaspacho Andalou...',
      description: 'Décrivez votre produit ici...'
    },
    variants: {
      description: 'Ex: Portion normale, Demi-portion, Petite...',
      price: '0.00'
    }
  },
  helpTexts: {
    variants: {
      inactiveNotVisible: 'Les variantes inactives n\'apparaîtront pas dans le menu public'
    }
  }
}
