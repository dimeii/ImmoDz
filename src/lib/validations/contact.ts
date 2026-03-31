import { z } from "zod";

export const contactSchema = z.object({
  listingId: z.string().cuid(),
  message: z.string().min(10).max(2000),
  phone: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
