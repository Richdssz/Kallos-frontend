import { z } from "zod";

export const redefinirSenhaSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu e-mail profissional.")
    .email("Informe um endereço de e-mail válido."),
});

export type RedefinirSenhaFormData = z.infer<
  typeof redefinirSenhaSchema
>;