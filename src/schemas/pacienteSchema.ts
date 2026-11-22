import { z } from "zod";
import { validarCpf } from "@/utils/formatadores";

// Regras de validação do formulário de cadastro e edição de pacientes.
export const pacienteSchema = z.object({
  // Etapa 1: Dados pessoais
  nome: z
    .string()
    .trim()
    .min(3, "Informe o nome completo (mínimo 3 caracteres)."),
  cpf: z
    .string()
    .trim()
    .min(1, "Informe o CPF.")
    .refine(validarCpf, "CPF inválido. Verifique os dígitos."),
  dataNascimento: z
    .string()
    .min(1, "Informe a data de nascimento.")
    .refine((data) => {
      const parsed = new Date(data);
      return !Number.isNaN(parsed.getTime()) && parsed < new Date();
    }, "A data de nascimento deve estar no passado."),
  telefone: z
    .string()
    .trim()
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "Informe um telefone válido com DDD.",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Informe o e-mail.")
    .email("Informe um endereço de e-mail válido."),
  contatoEmergencia: z
    .string()
    .trim()
    .min(2, "Informe o nome do contato de emergência."),
  telefoneEmergencia: z
    .string()
    .trim()
    .refine(
      (val) => val.replace(/\D/g, "").length >= 10,
      "Informe o telefone de emergência com DDD.",
    ),

  // Etapa 2: Endereço
  endereco: z.object({
    cep: z
      .string()
      .trim()
      .refine(
        (val) => val.replace(/\D/g, "").length === 8,
        "Informe um CEP válido com 8 dígitos.",
      ),
    logradouro: z.string().trim().min(2, "Informe o logradouro."),
    numero: z.string().trim().min(1, "Informe o número."),
    complemento: z.string().trim().optional(),
    bairro: z.string().trim().min(2, "Informe o bairro."),
    cidade: z.string().trim().min(2, "Informe a cidade."),
    uf: z
      .string()
      .trim()
      .length(2, "Informe a UF com 2 letras.")
      .transform((v) => v.toUpperCase()),
  }),

  // Etapa 3: Definições clínicas (opcionais)
  honorario: z
    .union([
      z.number().min(0, "O honorário não pode ser negativo."),
      z.nan(),
      z.null(),
    ])
    .optional(),
  cid: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

export type PacienteFormData = z.infer<typeof pacienteSchema>;

// Campos validados ao clicar em "Avançar" em cada uma das 3 etapas.
export const CAMPOS_ETAPA_1 = [
  "nome",
  "cpf",
  "dataNascimento",
  "telefone",
  "email",
  "contatoEmergencia",
  "telefoneEmergencia",
] as const;

export const CAMPOS_ETAPA_2 = [
  "endereco.cep",
  "endereco.logradouro",
  "endereco.numero",
  "endereco.bairro",
  "endereco.cidade",
  "endereco.uf",
] as const;
