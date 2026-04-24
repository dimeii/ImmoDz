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
  email: z.string().email().or(z.literal("")).optional(),
  address: z.string().optional(),
  wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
  website: z
    .string()
    .trim()
    .url("URL invalide")
    .or(z.literal(""))
    .optional(),
  foundedYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .nullable()
    .optional(),
  logo: z.string().url().or(z.literal("")).optional(),
  coverImage: z.string().url().or(z.literal("")).optional(),
});

export type InviterMembreInput = z.infer<typeof inviterMembreSchema>;
export type UpdateMembreRoleInput = z.infer<typeof updateMembreRoleSchema>;
export type UpdateAgenceInput = z.infer<typeof updateAgenceSchema>;
