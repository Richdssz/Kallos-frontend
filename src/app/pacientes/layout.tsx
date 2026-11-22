import { ListagemPacientes } from "@/components/pacientes/ListagemPacientes";

// Mantém a listagem sempre visível ao fundo enquanto rotas filhas (/novo, /[id], /[id]/editar) abrem como popups.
export default function PacientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ListagemPacientes />
      {children}
    </>
  );
}
