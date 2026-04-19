import type { Prisma } from "@prisma/client";
import type { SavedSearchFilters } from "@/lib/validations/saved-search";

export function filtersToListingWhere(
  filters: SavedSearchFilters
): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

  if (filters.transactionType) where.transactionType = filters.transactionType;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.wilayaCode) where.wilayaCode = filters.wilayaCode;
  if (filters.quartierId) where.quartierId = filters.quartierId;
  if (filters.rooms) where.rooms = { gte: filters.rooms };
  if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };
  if (filters.bathrooms) where.bathrooms = { gte: filters.bathrooms };

  if (filters.priceMin != null || filters.priceMax != null) {
    where.price = {};
    if (filters.priceMin != null) where.price.gte = filters.priceMin;
    if (filters.priceMax != null) where.price.lte = filters.priceMax;
  }

  if (filters.surfaceMin != null || filters.surfaceMax != null) {
    where.surface = {};
    if (filters.surfaceMin != null) where.surface.gte = filters.surfaceMin;
    if (filters.surfaceMax != null) where.surface.lte = filters.surfaceMax;
  }

  return where;
}

export function describeFilters(filters: SavedSearchFilters): string {
  const parts: string[] = [];
  if (filters.transactionType)
    parts.push(filters.transactionType === "RENT" ? "Location" : "Vente");
  if (filters.propertyType) parts.push(filters.propertyType.toLowerCase());
  if (filters.wilayaCode) parts.push(`wilaya ${filters.wilayaCode}`);
  if (filters.priceMin != null) parts.push(`≥ ${filters.priceMin} DA`);
  if (filters.priceMax != null) parts.push(`≤ ${filters.priceMax} DA`);
  if (filters.surfaceMin != null) parts.push(`≥ ${filters.surfaceMin} m²`);
  if (filters.rooms) parts.push(`${filters.rooms}+ pièces`);
  return parts.join(" · ") || "Tous les biens";
}
