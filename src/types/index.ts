export type TransactionType = "RENT" | "SALE";

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "VILLA"
  | "STUDIO"
  | "LAND"
  | "COMMERCIAL"
  | "OFFICE"
  | "GARAGE"
  | "OTHER";

export type ListingStatus = "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED" | "ARCHIVED";

export type Role = "ADMIN" | "AGENCY_DIRECTOR" | "AGENCY_EMPLOYEE" | "USER";

export interface MapPin {
  id: string;
  title: string;
  price: number;
  transactionType: TransactionType;
  propertyType: PropertyType;
  lng: number;
  lat: number;
  thumbnail?: string;
}

export interface SearchFilters {
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  wilayaCode?: number;
  priceMin?: number;
  priceMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  rooms?: number;
  bounds?: [number, number, number, number]; // [west, south, east, north]
}
