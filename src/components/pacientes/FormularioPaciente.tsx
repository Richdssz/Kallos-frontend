"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CAMPOS_ETAPA_1,
  CAMPOS_ETAPA_2,
  PacienteFormData,
  pacienteSchema,
} from "@/schemas/pacienteSchema";
import {
  formatarCep,
  formatarCpf,
  formatarTelefone,
} from "@/utils/formatadores";
import { buscarEnderecoPorCep } from "@/services/cepService";
import { ApiError } from "@/services/api";
import {
  useAtualizarPaciente,
  useCriarPaciente,
} from "@/hooks/usePacientes";
import { PacienteRequestDTO, PacienteResponseDTO } from "@/types/paciente";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Stethoscope,
  User,
} from "lucide-react";

interface FormularioPacienteProps {
  modo: "criar" | "editar";
  pacienteInicial?: PacienteResponseDTO;
}

const ETAPAS = [
  { numero: 1, titulo: "Dados pessoais", icone: User },
  { numero: 2, titulo: "Endereço", icone: MapPin },
  { numero: 3, titulo: "Definições clínicas", icone: Stethoscope },
] as const;

export function FormularioPaciente({
  modo,
  pacienteInicial,
}: FormularioPacienteProps) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [erroGeral, setErroGeral] = useState("");

  const criarMutation = useCriarPaciente();
  const atualizarMutation = useAtualizarPaciente(pacienteInicial?.id ?? "");
  const salvando = criarMutation.isPending || atualizarMutation.isPending;

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: pacienteInicial
      ? {
          nome: pacienteInicial.nome,
          cpf: pacienteInicial.cpf,
          dataNascimento: pacienteInicial.dataNascimento,
          telefone: pacienteInicial.telefone,
          email: pacienteInicial.email,
          contatoEmergencia: pacienteInicial.contatoEmergencia,
          telefoneEmergencia: pacienteInicial.telefoneEmergencia,
          endereco: {
            cep: pacienteInicial.endereco.cep,
            logradouro: pacienteInicial.endereco.logradouro,
            numero: pacienteInicial.endereco.numero,
            complemento: pacienteInicial.endereco.complemento ?? "",
            bairro: pacienteInicial.endereco.bairro,
            cidade: pacienteInicial.endereco.cidade,
            uf: pacienteInicial.endereco.uf,
          },
          honorario: pacienteInicial.honorario ?? undefined,
          cid: pacienteInicial.cid ?? "",
          observacoes: pacienteInicial.observacoes ?? "",
        }
      : {
          nome: "",
          cpf: "",
          dataNascimento: "",
          telefone: "",
          email: "",
          contatoEmergencia: "",
          telefoneEmergencia: "",
          endereco: {
            cep: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            uf: "",
          },
          honorario: undefined,
          cid: "",
          observacoes: "",
        },
  });

  async function avancarEtapa() {
    setErroGeral("");
    if (etapa === 1) {
      const valido = await trigger([...CAMPOS_ETAPA_1]);
      if (valido) setEtapa(2);
    } else if (etapa === 2) {
      const valido = await trigger([...CAMPOS_ETAPA_2]);
      if (valido) setEtapa(3);
    }
  }

  function voltarEtapa() {
    setErroGeral("");
    if (etapa === 2) setEtapa(1);
    if (etapa === 3) setEtapa(2);
  }

  async function handleCepChange(valorBruto: string) {
    const cepFormatado = formatarCep(valorBruto);
    setValue("endereco.cep", cepFormatado, { shouldValidate: true });
    setErroCep("");

    const digitos = cepFormatado.replace(/\D/g, "");
    if (digitos.length !== 8) return;

    setBuscandoCep(true);
    try {
      const endereco = await buscarEnderecoPorCep(digitos);
      setValue("endereco.logradouro", endereco.logradouro, { shouldValidate: true });
      setValue("endereco.bairro", endereco.bairro, { shouldValidate: true });
      setValue("endereco.cidade", endereco.cidade, { shouldValidate: true });
      setValue("endereco.uf", endereco.uf, { shouldValidate: true });
    } catch (erro) {
      setErroCep(
        erro instanceof Error ? erro.message : "Não foi possível consultar o CEP."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  async function onSubmit(dados: PacienteFormData) {
    setErroGeral("");

    const dto: PacienteRequestDTO = {
      nome: dados.nome,
      cpf: dados.cpf,
      dataNascimento: dados.dataNascimento,
      telefone: dados.telefone,
      email: dados.email,
      contatoEmergencia: dados.contatoEmergencia,
      telefoneEmergencia: dados.telefoneEmergencia,
      endereco: dados.endereco,
      honorario:
        typeof dados.honorario === "number" && !Number.isNaN(dados.honorario)
          ? dados.honorario
          : null,
      cid: dados.cid || undefined,
      observacoes: dados.observacoes || undefined,
    };

    try {
      if (modo === "criar") {
        const criado = await criarMutation.mutateAsync(dto);
        router.push(`/pacientes/${criado.id}`);
      } else if (pacienteInicial) {
        await atualizarMutation.mutateAsync(dto);
        router.push("/pacientes");
      }
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 409) {
        // Duplicidade de CPF: volta para etapa 1 e exibe erro no próprio campo.
        setError("cpf", {
          message:
            erro.campos?.[0]?.mensagem ??
            "Já existe um paciente cadastrado com este CPF.",
        });
        setEtapa(1);
        return;
      }

      setErroGeral(
        erro instanceof Error
          ? erro.message
          : "Não foi possível salvar os dados do paciente."
      );
    }
  }

  function onInvalid(erros: FieldErrors<PacienteFormData>) {
    const temErroEtapa1 = CAMPOS_ETAPA_1.some((campo) => Boolean(erros[campo]));
    if (temErroEtapa1) {
      setEtapa(1);
      return;
    }
    if (erros.endereco) {
      setEtapa(2);
      return;
    }
    setEtapa(3);
  }

  const inputClass = (temErro: boolean) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-verde-profundo placeholder:text-verde-acinzentado/65 outline-none transition-colors focus:border-verde-kallos ${
      temErro ? "border-red-500" : "border-salvia-claro"
    }`;

  return (
    <div className="rounded-2xl border border-salvia-claro bg-white shadow-xs overflow-hidden">
      {/* Barra de progresso / Abas das 3 etapas */}
      <div className="border-b border-salvia-claro bg-creme/50 px-6 py-4">
        <ol className="flex flex-wrap items-center justify-between gap-3">
          {ETAPAS.map((item) => {
            const Icon = item.icone;
            const concluida = etapa > item.numero;
            const ativa = etapa === item.numero;
            const podeClicarDireto = modo === "editar";

            const conteudo = (
              <>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                    ativa
                      ? "border-verde-kallos bg-verde-kallos text-white"
                      : concluida
                        ? "border-verde-kallos bg-salvia-claro text-verde-kallos"
                        : "border-salvia-claro bg-white text-verde-acinzentado"
                  }`}
                >
                  {concluida && modo === "criar" ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </span>
                <span>
                  {item.numero}. {item.titulo}
                </span>
              </>
            );

            return (
              <li key={item.numero}>
                {podeClicarDireto ? (
                  <button
                    type="button"
                    onClick={() => setEtapa(item.numero)}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      ativa
                        ? "text-verde-kallos bg-salvia-claro/60"
                        : "text-verde-acinzentado hover:text-verde-profundo"
                    }`}
                  >
                    {conteudo}
                  </button>
                ) : (
                  <div
                    className={`flex items-center gap-2.5 text-xs font-medium ${
                      ativa
                        ? "text-verde-kallos"
                        : concluida
                          ? "text-verde-profundo"
                          : "text-verde-acinzentado"
                    }`}
                  >
                    {conteudo}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="p-6">
        {erroGeral && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {erroGeral}
          </div>
        )}

        {/* Etapa 1: Dados pessoais */}
        {etapa === 1 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="nome"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Nome completo *
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Ex: Mariana Costa"
                aria-invalid={!!errors.nome}
                className={inputClass(!!errors.nome)}
                {...register("nome")}
              />
              {errors.nome && (
                <p className="mt-1 text-xs text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="cpf"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                CPF *
              </label>
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                aria-invalid={!!errors.cpf}
                className={`fonte-codigo ${inputClass(!!errors.cpf)}`}
                {...register("cpf", {
                  onChange: (e) =>
                    setValue("cpf", formatarCpf(e.target.value), {
                      shouldValidate: true,
                    }),
                })}
              />
              {errors.cpf && (
                <p className="mt-1 text-xs text-red-600">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="dataNascimento"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Data de nascimento *
              </label>
              <input
                id="dataNascimento"
                type="date"
                aria-invalid={!!errors.dataNascimento}
                className={inputClass(!!errors.dataNascimento)}
                {...register("dataNascimento")}
              />
              {errors.dataNascimento && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.dataNascimento.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="telefone"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Telefone / WhatsApp *
              </label>
              <input
                id="telefone"
                type="tel"
                placeholder="(11) 98765-4321"
                aria-invalid={!!errors.telefone}
                className={inputClass(!!errors.telefone)}
                {...register("telefone", {
                  onChange: (e) =>
                    setValue("telefone", formatarTelefone(e.target.value), {
                      shouldValidate: true,
                    }),
                })}
              />
              {errors.telefone && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.telefone.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                E-mail *
              </label>
              <input
                id="email"
                type="email"
                placeholder="paciente@email.com"
                aria-invalid={!!errors.email}
                className={inputClass(!!errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="contatoEmergencia"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Contato de emergência *
              </label>
              <input
                id="contatoEmergencia"
                type="text"
                placeholder="Ex: Helena Costa (Mãe)"
                aria-invalid={!!errors.contatoEmergencia}
                className={inputClass(!!errors.contatoEmergencia)}
                {...register("contatoEmergencia")}
              />
              {errors.contatoEmergencia && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.contatoEmergencia.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="telefoneEmergencia"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Telefone de emergência *
              </label>
              <input
                id="telefoneEmergencia"
                type="tel"
                placeholder="(11) 99123-4567"
                aria-invalid={!!errors.telefoneEmergencia}
                className={inputClass(!!errors.telefoneEmergencia)}
                {...register("telefoneEmergencia", {
                  onChange: (e) =>
                    setValue(
                      "telefoneEmergencia",
                      formatarTelefone(e.target.value),
                      { shouldValidate: true }
                    ),
                })}
              />
              {errors.telefoneEmergencia && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.telefoneEmergencia.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Etapa 2: Endereço com busca automática de CEP */}
        {etapa === 2 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label
                htmlFor="cep"
                className="mb-1.5 flex items-center justify-between text-xs font-medium text-verde-profundo"
              >
                <span>CEP *</span>
                {buscandoCep && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-verde-kallos">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Buscando...
                  </span>
                )}
              </label>
              <input
                id="cep"
                type="text"
                inputMode="numeric"
                placeholder="00000-000"
                aria-invalid={!!errors.endereco?.cep || !!erroCep}
                className={`fonte-codigo ${inputClass(
                  !!errors.endereco?.cep || !!erroCep
                )}`}
                {...register("endereco.cep", {
                  onChange: (e) => handleCepChange(e.target.value),
                })}
              />
              {errors.endereco?.cep && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endereco.cep.message}
                </p>
              )}
              {erroCep && <p className="mt-1 text-xs text-amber-700">{erroCep}</p>}
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="logradouro"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Logradouro *
              </label>
              <input
                id="logradouro"
                type="text"
                placeholder="Rua, Avenida..."
                aria-invalid={!!errors.endereco?.logradouro}
                className={inputClass(!!errors.endereco?.logradouro)}
                {...register("endereco.logradouro")}
              />
              {errors.endereco?.logradouro && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endereco.logradouro.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="numero"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Número *
              </label>
              <input
                id="numero"
                type="text"
                placeholder="Ex: 420"
                aria-invalid={!!errors.endereco?.numero}
                className={inputClass(!!errors.endereco?.numero)}
                {...register("endereco.numero")}
              />
              {errors.endereco?.numero && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endereco.numero.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="complemento"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Complemento (opcional)
              </label>
              <input
                id="complemento"
                type="text"
                placeholder="Apto, bloco, sala..."
                className={inputClass(false)}
                {...register("endereco.complemento")}
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="bairro"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Bairro *
              </label>
              <input
                id="bairro"
                type="text"
                placeholder="Bairro"
                aria-invalid={!!errors.endereco?.bairro}
                className={inputClass(!!errors.endereco?.bairro)}
                {...register("endereco.bairro")}
              />
              {errors.endereco?.bairro && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endereco.bairro.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="cidade"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Cidade *
              </label>
              <input
                id="cidade"
                type="text"
                placeholder="Cidade"
                aria-invalid={!!errors.endereco?.cidade}
                className={inputClass(!!errors.endereco?.cidade)}
                {...register("endereco.cidade")}
              />
              {errors.endereco?.cidade && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endereco.cidade.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="uf"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                UF *
              </label>
              <input
                id="uf"
                type="text"
                maxLength={2}
                placeholder="PE"
                aria-invalid={!!errors.endereco?.uf}
                className={`uppercase ${inputClass(!!errors.endereco?.uf)}`}
                {...register("endereco.uf")}
              />
              {errors.endereco?.uf && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endereco.uf.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Etapa 3: Definições clínicas */}
        {etapa === 3 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="honorario"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Honorário por sessão (R$)
              </label>
              <input
                id="honorario"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 180.00"
                aria-invalid={!!errors.honorario}
                className={inputClass(!!errors.honorario)}
                {...register("honorario", { valueAsNumber: true })}
              />
              {errors.honorario && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.honorario.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="cid"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                CID vinculado (opcional)
              </label>
              <input
                id="cid"
                type="text"
                placeholder="Ex: F41.1 — Ansiedade generalizada"
                className={inputClass(false)}
                {...register("cid")}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="observacoes"
                className="mb-1.5 block text-xs font-medium text-verde-profundo"
              >
                Observações e histórico preliminar
              </label>
              <textarea
                id="observacoes"
                rows={4}
                placeholder="Anotações iniciais ou preferências de horário..."
                className={inputClass(false)}
                {...register("observacoes")}
              />
            </div>
          </div>
        )}

        {/* Rodapé de navegação entre etapas */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-salvia-claro pt-5">
          <div className="flex items-center gap-2">
            {etapa === 1 ? (
              <Link
                href="/pacientes"
                className="inline-flex items-center gap-1.5 rounded-xl border border-salvia-claro px-4 py-2 text-sm font-medium text-verde-profundo hover:bg-creme transition-colors"
              >
                Cancelar
              </Link>
            ) : (
              <button
                type="button"
                onClick={voltarEtapa}
                className="inline-flex items-center gap-1.5 rounded-xl border border-salvia-claro px-4 py-2 text-sm font-medium text-verde-profundo hover:bg-creme transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {modo === "criar" && etapa < 3 ? (
              <button
                type="button"
                onClick={avancarEtapa}
                className="inline-flex items-center gap-2 rounded-xl bg-verde-kallos px-5 py-2.5 text-sm font-medium text-white hover:bg-verde-profundo transition-colors cursor-pointer"
              >
                Próxima etapa
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                {modo === "editar" && etapa < 3 && (
                  <button
                    type="button"
                    onClick={avancarEtapa}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-salvia-claro px-4 py-2 text-sm font-medium text-verde-profundo hover:bg-creme transition-colors cursor-pointer"
                  >
                    Próxima
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={salvando}
                  className="inline-flex items-center gap-2 rounded-xl bg-verde-kallos px-5 py-2.5 text-sm font-medium text-white hover:bg-verde-profundo disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
                  {salvando
                    ? "Salvando..."
                    : modo === "criar"
                      ? "Cadastrar paciente"
                      : "Salvar alterações"}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
