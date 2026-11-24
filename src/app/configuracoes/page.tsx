export default function ConfiguracoesPage() {
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-verde-acinzentado">
          Administração
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-verde-profundo sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-verde-acinzentado">
          Gerencie os dados do consultório e as informações do seu perfil.
        </p>
      </header>

      <section
        aria-labelledby="dados-configuracoes"
        className="rounded-2xl border border-salvia-claro bg-white p-5 shadow-sm sm:p-6 lg:p-8"
      >
        <div className="border-b border-salvia-claro pb-5">
          <h2
            id="dados-configuracoes"
            className="text-lg font-semibold text-verde-profundo"
          >
            Dados da conta
          </h2>
          <p className="mt-1 text-sm leading-6 text-verde-acinzentado">
           Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates fuga voluptatum veniam provident assumenda eum iste, ipsum perferendis repudiandae saepe officiis repellendus ullam voluptatem quos blanditiis aspernatur odit at eligendi.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-verde-salvia px-4 py-10 text-center">
          <p className="text-sm text-verde-acinzentado">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem quis, laboriosam tempora reiciendis ullam et fuga inventore architecto nostrum repellat omnis laudantium. Incidunt nesciunt ab repudiandae recusandae. Veritatis, repellat eveniet.
          </p>
        </div>
      </section>
    </main>
  );
}
