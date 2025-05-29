import { ProductResponseDTO } from '../dtos/product';

// The serialized type can often be the same as the Response DTO
// or a more specific version if you transform data before sending it to the client.
export type SerializedProduct = ProductResponseDTO;
