import { z } from 'zod';

const emailSchema = z
  .string()
  .min(1, "Email manzilni kiriting")
  .email("Email manzil noto'g'ri formatda");

const passwordSchema = z
  .string()
  .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    shopName: z
      .string()
      .min(2, "Do'kon nomi kamida 2 ta belgidan iborat bo'lishi kerak")
      .max(100, "Do'kon nomi 100 ta belgidan oshmasligi kerak"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Parolni tasdiqlang"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmadi",
    path: ['confirmPassword'],
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
