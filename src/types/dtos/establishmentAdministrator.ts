export interface EstablishmentAdministratorCreateDTO {
  user_id: number;
  establishment_id: number;
}

// No specific update DTO needed as it's a join table with a composite key.
// Updates would typically involve deleting and recreating the record if necessary,
// or handled by cascading updates from User or Establishment if configured.

export interface EstablishmentAdministratorDTO {
  user_id: number;
  establishment_id: number;
  // Include user and establishment details if needed for responses
  // userName?: string;
  // establishmentName?: string;
}
