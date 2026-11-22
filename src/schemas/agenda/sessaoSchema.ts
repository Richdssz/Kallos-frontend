import { z } from "zod";
import { parseValorMonetarioBR } from "@/utils/agendaDatas";

export const sessaoSchema = z
  .object({
    pacienteId: z.string().min(1, "Selecione um paciente vinculado."),
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
    horario: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Informe um horário válido (HH:mm)."),
    duracaoMinutos: z.enum(["30", "45", "50", "60", "90"], {
      message: "Selecione uma duração válida.",
    }),
    modalidade: z.enum(["Presencial", "Online"], {
      message: "Selecione a modalidade (Presencial ou Online).",
    }),
    valorTexto: z
      .string()
      .trim()
      .min(1, "Informe o valor da sessão.")
      .refine((texto) => {
        const valor = parseValorMonetarioBR(texto);
        return !Number.isNaN(valor) && valor >= 0 && valor <= 100000;
      }, "Informe um valor monetário válido (ex.: 220,00)."),
    statusPagamento: z.enum(["Pendente", "Pago"]),
    formaPagamento: z.enum(["", "Pix", "Cartao"]),
    observacoes: z
      .string()
      .max(500, "As observações devem ter no máximo 500 caracteres.")
      .optional(),
  })
  .superRefine((dados, ctx) => {
    if (dados.statusPagamento === "Pago" && !dados.formaPagamento) {
      ctx.addIssue({
        code: "custom",
        path: ["formaPagamento"],
        message: "Informe a forma de pagamento (Pix ou Cartão).",
      });
    }
  });

export type SessaoFormData = z.infer<typeof sessaoSchema>;

export function formatarNumeroParaInputBRL(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}
