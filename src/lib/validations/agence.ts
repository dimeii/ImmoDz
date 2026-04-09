import { z } from "zod";

export const inviterMembreSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const updateMembreRoleSchema = z.object({
  role: z.enum(["AGENCY_DIRECTOR", "AGENCY_EMPLOYEE"]),
});

export const updateAgenceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(2000).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
});

export type InviterMembreInput = z.infer<typeof inviterMembreSchema>;
export type UpdateMembreRoleInput = z.infer<typeof updateMembreRoleSchema>;
export type UpdateAgenceInput = z.infer<typeof updateAgenceSchema>;
