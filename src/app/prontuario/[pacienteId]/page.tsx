"use client";

import { useParams } from "next/navigation";
import { ProntuarioPage } from "@/components/prontuario/ProntuarioPage";

export default function ProntuarioPacienteRoute() {
  const params = useParams<{ pacienteId: string }>();
  return <ProntuarioPage pacienteIdInicial={params?.pacienteId ?? ""} />;
}
