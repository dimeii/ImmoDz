import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  price: z.number().positive(),
  transactionType: z.enum(["RENT", "SALE"]),
  propertyType: z.enum([
    "APARTMENT",
    "HOUSE",
    "VILLA",
    "STUDIO",
    "LAND",
    "COMMERCIAL",
    "OFFICE",
    "GARAGE",
    "OTHER",
  ]),
  address: z.string().optional(),
  wilayaCode: z.number().int().min(1).max(58),
  commune: z.string().optional(),
  quartierId: z.string().optional(),
  surface: z.number().positive().optional(),
  rooms: z.number().int().positive().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().positive().optional(),
  yearBuilt: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasGarden: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  isFurnished: z.boolean().optional(),
  hasStorefront: z.boolean().optional(),
  hasWater: z.boolean().optional(),
  hasElectricity: z.boolean().optional(),
  hasGas: z.boolean().optional(),
  hasFiber: z.boolean().optional(),
  surPlan: z.boolean().optional(),
  contactPhone: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .optional()
    .or(z.literal("")),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

const booleanFilter = z
  .enum(["true", "false", ""])
  .optional()
  .transform((v) => (v === "true" ? true : v === "false" ? false : undefined));

export const searchFiltersSchema = z.object({
  transactionType: z.enum(["RENT", "SALE"]).optional(),
  propertyType: z
    .enum([
      "APARTMENT",
      "HOUSE",
      "VILLA",
      "STUDIO",
      "LAND",
      "COMMERCIAL",
      "OFFICE",
      "GARAGE",
      "OTHER",
    ])
    .optional(),
  wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
  quartier: z.string().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().positive().optional(),
  surfaceMin: z.coerce.number().positive().optional(),
  surfaceMax: z.coerce.number().positive().optional(),
  rooms: z.coerce.number().int().positive().optional(),
  bedrooms: z.coerce.number().int().positive().optional(),
  bathrooms: z.coerce.number().int().positive().optional(),
  floor: z.coerce.number().int().nonnegative().optional(),
  yearBuilt: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  hasElevator: booleanFilter,
  hasParking: booleanFilter,
  hasGarden: booleanFilter,
  hasPool: booleanFilter,
  isFurnished: booleanFilter,
  hasStorefront: booleanFilter,
  hasWater: booleanFilter,
  hasElectricity: booleanFilter,
  hasGas: booleanFilter,
  hasFiber: booleanFilter,
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
