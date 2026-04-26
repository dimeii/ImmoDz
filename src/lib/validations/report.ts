import { z } from "zod";

export const REPORT_REASONS = [
  "FAKE",
  "PRICE",
  "ALREADY_RENTED",
  "DUPLICATE",
  "INAPPROPRIATE",
  "WRONG_LOCATION",
  "OTHER",
] as const;

export const REPORT_REASON_LABELS: Record<(typeof REPORT_REASONS)[number], string> = {
  FAKE: "Annonce frauduleuse / faux bien",
  PRICE: "Prix incohérent ou trompeur",
  ALREADY_RENTED: "Bien déjà loué / vendu",
  DUPLICATE: "Doublon d'une autre annonce",
  INAPPROPRIATE: "Contenu inapproprié (photos, description)",
  WRONG_LOCATION: "Localisation incorrecte",
  OTHER: "Autre",
};

export const reportListingSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  comment: z.string().trim().max(2000).optional(),
});

export const reviewReportSchema = z.object({
  reportId: z.string().cuid(),
  action: z.enum(["REVIEWED", "DISMISSED"]),
  rejectListing: z.boolean().optional(),
  rejectionReason: z.string().trim().min(3).max(500).optional(),
});

export type ReportListingInput = z.infer<typeof reportListingSchema>;
export type ReviewReportInput = z.infer<typeof reviewReportSchema>;
