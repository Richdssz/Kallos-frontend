export interface EvolucaoClinica {
  id: string;
  data: string;
  sessao: string;
  resumo: string;
}

export interface ProntuarioPaciente {
  id: string;
  nome: string;
  dataAbertura: string;
  ultimaEvolucao: string;
  anamnese: string;
  observacoes: string;
  cidPrincipal: string;
  cidSecundario: string;
  evolucoes: EvolucaoClinica[];
}

export const PACIENTES_PRONTUARIO: ProntuarioPaciente[] = [
  {
    id: "1",
    nome: "Mariana Costa",
    dataAbertura: "14 mar 2025",
    ultimaEvolucao: "06 nov 2026",
    anamnese:
      "Paciente relata episódios de ansiedade relacionados ao contexto profissional. Refere alterações no sono nas últimas semanas e dificuldade de concentração em períodos de alta demanda.\n\nApresenta boa rede de apoio familiar. Objetivos terapêuticos iniciais incluem identificação de gatilhos e desenvolvimento de estratégias de regulação emocional.",
    observacoes:
      "Acompanhamento semanal às terças-feiras, 14h. Boa adesão às tarefas de automonitoramento.",
    cidPrincipal: "F41.1 — Ansiedade generalizada",
    cidSecundario: "F32.1 — Episódio depressivo moderado",
    evolucoes: [
      {
        id: "ev-1",
        data: "06 nov 2026",
        sessao: "Sessão #12 · Presencial",
        resumo:
          "Trabalhadas técnicas de respiração diafragmática e reestruturação cognitiva diante de prazos no trabalho.",
      },
      {
        id: "ev-2",
        data: "30 out 2026",
        sessao: "Sessão #11 · Presencial",
        resumo:
          "Paciente relatou melhora gradual na qualidade do sono após ajuste na rotina noturna.",
      },
    ],
  },
  {
    id: "2",
    nome: "Lucas Almeida",
    dataAbertura: "02 jun 2025",
    ultimaEvolucao: "10 nov 2026",
    anamnese:
      "Paciente procurou atendimento relatando desânimo persistente e redução de interesse em atividades sociais nos últimos três meses.",
    observacoes:
      "Atendimento online quinzenal. Foco em ativação comportamental.",
    cidPrincipal: "F32.0 — Episódio depressivo leve",
    cidSecundario: "Z73.0 — Esgotamento (Burnout)",
    evolucoes: [
      {
        id: "ev-3",
        data: "10 nov 2026",
        sessao: "Sessão #08 · Online",
        resumo:
          "Retomada gradual de atividades físicas duas vezes na semana com resposta positiva no humor.",
      },
    ],
  },
  {
    id: "3",
    nome: "Beatriz Nogueira",
    dataAbertura: "19 ago 2025",
    ultimaEvolucao: "06 nov 2026",
    anamnese:
      "Queixa principal voltada ao estresse em processo de transição de carreira e insegurança na tomada de decisões.",
    observacoes: "Sessões presenciais às sextas-feiras.",
    cidPrincipal: "F43.2 — Transtornos de adaptação",
    cidSecundario: "F41.1 — Ansiedade generalizada",
    evolucoes: [
      {
        id: "ev-4",
        data: "06 nov 2026",
        sessao: "Sessão #06 · Presencial",
        resumo:
          "Mapeamento de valores pessoais e planejamento de metas profissionais de curto prazo.",
      },
    ],
  },
];

export const CATALOGO_CID = [
  "F41.1 — Ansiedade generalizada",
  "F41.0 — Transtorno de pânico",
  "F32.0 — Episódio depressivo leve",
  "F32.1 — Episódio depressivo moderado",
  "F43.1 — Estresse pós-traumático",
  "F43.2 — Transtornos de adaptação",
  "F40.1 — Fobias sociais",
  "F90.0 — TDAH",
  "Z73.0 — Esgotamento (Burnout)",
];
