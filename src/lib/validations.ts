import { z } from "zod";

const optionalContact = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""));

export const enquirySchema = z
  .object({
    type: z.enum(["contact", "admissions"]),
    name: z.string().trim().min(2, "Please enter your name.").max(120),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address.")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .max(40, "Please enter a shorter telephone number.")
      .optional()
      .or(z.literal("")),
    category: z.string().trim().min(2, "Please choose a category."),
    admissionLevel: z.enum(["S1", "S5", "general"]).optional().or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(20, "Please provide a little more detail in your message.")
      .max(4000),
    consent: z.literal("on", {
      error: "Please confirm that the school may use this enquiry to reply.",
    }),
    website: z.string().max(0).optional().or(z.literal("")),
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: "Please provide an email address or a telephone number.",
    path: ["email"],
  })
  .refine((value) => value.type !== "admissions" || Boolean(value.admissionLevel), {
    message: "Please choose an admission level.",
    path: ["admissionLevel"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const newsSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(80),
  summary: z.string().trim().min(10).max(400),
  body: z.string().trim().min(20),
  category: z.string().trim().min(2).max(60),
  coverImageUrl: optionalContact,
  authorName: optionalContact,
  status: z.enum(["draft", "review", "published", "archived"]),
  publishedAt: optionalContact,
  featured: z.boolean().optional(),
  coverAltText: optionalContact,
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type NewsInput = z.infer<typeof newsSchema>;
