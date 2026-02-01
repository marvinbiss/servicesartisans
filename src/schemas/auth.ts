import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Mot de passe requis'),
  remember_me: z.boolean().optional().default(false),
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirm_password: z.string().min(1, 'Confirmation requise'),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide')
    .transform((v) => v.toLowerCase().trim()),
})

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirm_password: z.string().min(1, 'Confirmation requise'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
