import { z } from "zod";

export const createThreadSchema = z.object({
  listingId: z.string().cuid(),
  body: z.string().trim().min(2).max(5000),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
