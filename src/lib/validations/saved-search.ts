import { z } from "zod";

export const savedSearchFiltersSchema = z
  .object({
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
    wilayaCode: z.number().int().optional(),
    quartierId: z.string().optional(),
    priceMin: z.number().nonnegative().optional(),
    priceMax: z.number().nonnegative().optional(),
    surfaceMin: z.number().nonnegative().optional(),
    surfaceMax: z.number().nonnegative().optional(),
    rooms: z.number().int().nonnegative().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
  })
  .strict();

export type SavedSearchFilters = z.infer<typeof savedSearchFiltersSchema>;

export const createSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  filters: savedSearchFiltersSchema,
});
