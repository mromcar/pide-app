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
    settings: 'Paramètres'
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
      confirm: 'Confirmer'
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
      deleteMessage: 'Êtes-vous sûr de vouloir supprimer ce produit?'
    },
    variants: {
      title: 'Variantes',
      addNew: 'Ajouter Nouvelle Variante',
      edit: 'Modifier Variante',
      delete: 'Supprimer Variante',
      name: 'Nom',
      priceModifier: 'Modificateur de Prix',
      active: 'Actif'
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
    title: 'Supervision des Commandes',
    subtitle: 'Surveillez et gérez toutes les commandes',
    filters: {
      all: 'Toutes les Commandes',
      pending: 'En Attente',
      preparing: 'En Préparation',
      ready: 'Prêtes',
      delivered: 'Livrées',
      cancelled: 'Annulées'
    },
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
    optional: 'Optionnel'
  },
  messages: {
    success: {
      categoryCreated: 'Catégorie créée avec succès',
      categoryUpdated: 'Catégorie mise à jour avec succès',
      categoryDeleted: 'Catégorie supprimée avec succès',
      productCreated: 'Produit créé avec succès',
      productUpdated: 'Produit mis à jour avec succès',
      productDeleted: 'Produit supprimé avec succès',
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
      employeeCreateFailed: 'Échec de la création de l\'employé',
      employeeUpdateFailed: 'Échec de la mise à jour de l\'employé',
      employeeDeleteFailed: 'Échec de la suppression de l\'employé',
      orderUpdateFailed: 'Échec de la mise à jour de la commande',
      loadingFailed: 'Échec du chargement des données'
    }
  }
}