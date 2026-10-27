import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .email("Enter a valid email address");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email,
  password: z.string().min(8, "Use at least 8 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
