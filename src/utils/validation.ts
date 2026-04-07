import { z } from 'zod';

export const phoneSchema = z
  .string()
  .min(9, "Telefon raqam kamida 9 ta raqamdan iborat bo'lishi kerak")
  .regex(/^\+?[0-9\s\-()]+$/, "Telefon raqam noto'g'ri formatda");

export const loginSchema = z.object({
  phone: phoneSchema,
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Tasdiqlash kodi 6 ta raqamdan iborat bo'lishi kerak")
    .regex(/^\d+$/, "Tasdiqlash kodi faqat raqamlardan iborat bo'lishi kerak"),
});

export const addCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak")
    .max(100, "Ism 100 ta belgidan oshmasligi kerak"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]*$/, "Telefon raqam noto'g'ri formatda")
    .optional()
    .or(z.literal('')),
  note: z
    .string()
    .max(500, "Izoh 500 ta belgidan oshmasligi kerak")
    .optional(),
});

export const addDebtSchema = z.object({
  amount: z
    .string()
    .min(1, "Summani kiriting")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Summa 0 dan katta bo'lishi kerak"
    ),
  description: z.string().max(200, "Izoh 200 ta belgidan oshmasligi kerak").optional(),
});
