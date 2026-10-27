import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100, "Keep your name under 100 characters"),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });

export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
