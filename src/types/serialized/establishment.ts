export interface SerializedEstablishment {
  establishmentId: number;
  name: string;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  acceptsOrders: boolean;
  // Puedes añadir más campos si los necesitas en el frontend
  // admins?: SerializedUser[]; // Si quieres incluir admins serializados
}
