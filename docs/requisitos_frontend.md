# Documento de Requisitos de Front-end

## Sistema de Gestão para Consultório Psicológico — Kallos Psi

| Campo | Informação |
|---|---|
| **Projeto** | Kallos Psi |
| **Documento** | Requisitos de front-end |
| **Versão** | 1.0 |
| **Data** | 19 de novembro de 2026 |
| **Equipe** | Rafael Pimentel, Matheus Alves, Ruan Ricardo, Richard Silva e Micael Barros |
| **Fonte oficial** | [`Kallos_Psi_Requisitos.pdf`](./Kallos_Psi_Requisitos.pdf) |

> Esta versão em Markdown organiza os requisitos do PDF oficial para consulta rápida. Em caso de divergência, prevalece o arquivo `Kallos_Psi_Requisitos.pdf`.

## Sumário

1. [Introdução](#1-introdução)
2. [Atendimento às exigências do projeto](#2-atendimento-às-exigências-do-projeto)
3. [Equipe, telas e rotas](#3-equipe-telas-e-rotas)
4. [Diretrizes transversais](#4-diretrizes-transversais)
5. [Requisitos funcionais por tela](#5-requisitos-funcionais-por-tela)
6. [Requisitos não funcionais de front-end](#6-requisitos-não-funcionais-de-front-end)

## 1. Introdução

### 1.1 Objetivo

Este documento especifica os requisitos do front-end do Kallos Psi, aplicação web de gestão para consultório psicológico. Ele define, para cada tela, o que deve ser exibido, como o usuário interage e quais regras a interface precisa respeitar, e serve de referência para o desenvolvimento e a avaliação do projeto.

### 1.2 Escopo

O documento cobre as 8 telas da aplicação, suas subtelas e estados, a organização de rotas, o consumo de dados, o estado global e a identidade visual. Os requisitos de back-end são tratados em documento próprio e não fazem parte deste.

### 1.3 Tecnologias de front-end

| Tecnologia | Uso no projeto |
|---|---|
| Next.js (App Router) | Estrutura da aplicação, roteamento entre páginas com `next/link` e `useRouter`, layouts compartilhados e proteção de rotas. |
| TanStack Query | Busca, cache, sincronização e atualização dos dados vindos da API. |
| Zustand | Estado global da sessão, identidade do consultório e preferências de interface. |
| React Hook Form + Zod | Formulários e validação de campos; pode ser substituído por equivalente. |
| CSS (Tailwind CSS recomendado) | Estilização conforme o sistema de design da seção 4.5. |

## 2. Atendimento às exigências do projeto

| Exigência | Como é atendida | Referência |
|---|---|---|
| Back-end com banco de dados | O front-end consome a API REST do projeto, que persiste os dados em banco relacional. | Seção 4.2 |
| Login, logout e esqueci minha senha | Telas Login e Redefinir senha, com encerramento de sessão no menu lateral. | RF-F09 a RF-F11 |
| CRUD completo de duas entidades | Pacientes e Sessões. | RF-F12 a RF-F19, RF-F26 a RF-F32, RF-F38 |
| Exibição de outras entidades, uma por participante | Consultório, Psicólogo, Prontuário e evoluções e indicadores consolidados. | RF-F01 a RF-F08, RF-F20 a RF-F25, RF-F39 a RF-F42 |
| TanStack Query ou SWR | TanStack Query em toda comunicação com a API. | Seção 4.2 |
| Ao menos 1 tela por participante, com Next Router | 8 telas distribuídas entre os 5 integrantes, ligadas por `next/link` e `useRouter`. | Seções 3 e 4.1 |
| Gerenciamento de estado global | Zustand, com escolha explícita do que fica no estado global. | Seção 4.3 |
| CSS cuidado, bonito e funcional | Sistema de design próprio e estados de interface padronizados. | Seções 4.4, 4.5 e 6 |

## 3. Equipe, telas e rotas

### 3.1 Responsabilidades

| Integrante | Telas sob responsabilidade |
|---|---|
| Rafael Pimentel | Painel geral |
| Matheus Alves | Configurações |
| Ruan Ricardo | Login, Redefinir senha e Criar conta |
| Richard Silva | Pacientes e Agenda e consultas |
| Micael Barros | Prontuário e CID |

### 3.2 Mapa de telas

| Nº | Tela | Rota | Responsável | Acesso |
|---:|---|---|---|---|
| 01 | Configurações | `/configuracoes` | Matheus Alves | Autenticado; conteúdo varia por perfil |
| 02 | Painel geral | `/painel` | Rafael Pimentel | Autenticado |
| 03 | Login | `/login` | Ruan Ricardo | Público |
| 04 | Redefinir senha | `/redefinir-senha` | Ruan Ricardo | Público |
| 05 | Pacientes | `/pacientes` | Richard Silva | Autenticado |
| 06 | Prontuário e CID | `/prontuario` | Micael Barros | Autenticado, restrito a psicólogos vinculados |
| 07 | Agenda e consultas | `/agenda` | Richard Silva | Autenticado |
| 08 | Criar conta | `/criar-conta` | Ruan Ricardo | Público |

## 4. Diretrizes transversais

As diretrizes abaixo valem para todas as telas e não pertencem a um integrante específico.

### 4.1 Roteamento com Next Router

- A navegação usa exclusivamente `next/link` e `useRouter`, sem recarregar a página.
- Telas autenticadas compartilham um layout com menu lateral, cartão do usuário, botão Sair e barra superior.
- O menu contém Painel geral, Pacientes, Agenda e consultas, Prontuário e CID e Configurações.
- Rotas protegidas por *middleware*: usuário sem sessão vai para `/login`; usuário autenticado em `/login`, `/criar-conta` ou `/redefinir-senha` vai para `/painel`.
- Há rotas dinâmicas para `/pacientes/[id]` e `/prontuario/[pacienteId]` e uma página 404 personalizada.

### 4.2 Dados do servidor com TanStack Query

Toda leitura e escrita na API passa por um cliente HTTP único e por `useQuery` e `useMutation`. Dados do servidor ficam no cache do TanStack Query, nunca no estado global. Após cada mutação, as consultas afetadas são invalidadas.

| Tela | Consultas | Mutações e invalidação |
|---|---|---|
| Configurações | `consultorio`, `perfil` | Salvar consultório ou perfil; invalida a chave correspondente. |
| Painel geral | `indicadores`, `sessoes-hoje`, `ritmo-mes` | Somente leitura. |
| Login e Criar conta | — | Autenticar e cadastrar; Sair limpa todo o cache. |
| Pacientes | `pacientes` (filtros, página), `paciente` (id) | Criar, editar, desativar e reativar; invalida `pacientes` e `paciente`. |
| Agenda e consultas | `sessoes` (semana, filtros) | Agendar, editar, cancelar e concluir; invalida `sessoes`, `indicadores` e `sessoes-hoje`. |
| Prontuário e CID | `prontuario` (pacienteId), `cid` (termo) | Editar e registrar evolução; invalida `prontuario`. |

### 4.3 Estado global com Zustand

O estado global guarda somente dados pequenos, compartilhados e necessários na primeira renderização. Dados clínicos e listas nunca entram nele.

| Store | O que guarda | Quem consome |
|---|---|---|
| `authStore` | Usuário, perfil de acesso e situação da sessão. | Layout, Configurações, rotas protegidas e Painel geral. |
| `consultorioStore` | Nome, logotipo e valor padrão da sessão. | Layout, Configurações e Agenda. |
| `uiStore` | Menu lateral recolhido e notificações; única store persistida. | Layout e todas as telas. |

Pacientes, sessões, prontuários e evoluções ficam no TanStack Query; valores de formulário ficam no React Hook Form; credenciais e token ficam sob responsabilidade do serviço de autenticação. Nenhum dado clínico ou pessoal é gravado em `localStorage`.

### 4.4 Estados de interface

- **Carregamento:** esqueletos no lugar do conteúdo e progresso nos botões.
- **Vazio:** mensagem objetiva, ícone e ação sugerida quando aplicável.
- **Erro:** linguagem clara, opção de tentar novamente e erros junto aos campos.
- **Sucesso e confirmação:** notificação após salvar e confirmação antes de ações destrutivas.

### 4.5 Sistema de design

A interface é sóbria, acolhedora e clínica, com verdes orgânicos sobre fundo creme.

| Token | Cor | Uso |
|---|---|---|
| Verde Kallos | `#334936` | Menu lateral, botões primários e cabeçalhos |
| Verde profundo | `#1D2C20` | Títulos e destaques |
| Verde sálvia | `#ACBFA9` | Acentos, gráficos e detalhes |
| Sálvia claro | `#E6ECE2` | Bordas, selos e fundos de apoio |
| Creme | `#FAF6F2` | Fundo das páginas |
| Verde acinzentado | `#7F8F7A` | Textos secundários e legendas |

- Fonte sem serifa geométrica; fonte monoespaçada para horários, CPF, CRP e códigos.
- Cartões arredondados, botões verdes com ícone, selos semânticos, tabelas discretas e ícones de traço fino.
- Cabeçalho com sobretítulo, título, subtítulo e ação principal à direita.
- Cada tela documenta seus fluxos e estados com a referência do requisito.

## 5. Requisitos funcionais por tela

Os identificadores RF-F acompanham a numeração das telas do protótipo.

### Configurações (Tela 01)

**Responsável:** Matheus Alves · **Rota:** `/configuracoes` · **Acesso:** autenticado, com conteúdo conforme o perfil.

Entidades: Consultório e Psicólogo. Estados: variante Administrador, variante Psicólogo, salvando e erro de validação.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F01** | Salvar dados do consultório | O administrador edita razão social, endereço, telefone e valor padrão. Salvar mostra progresso, confirma o sucesso e atualiza o `consultorioStore`. |
| **RF-F02** | Salvar perfil profissional | O psicólogo edita nome, CRP, telefone, e-mail e especialidade. Alterar o e-mail exige autenticação recente. Após salvar, atualiza o `authStore`. |
| **RF-F03** | Exibir configurações conforme o perfil | Exibe apenas o bloco pertinente ao perfil e um selo Administrador ou Psicólogo. Campos do outro perfil nunca são exibidos. |
| **RF-F04** | Alterar identidade visual | O administrador envia o logotipo com pré-visualização. A identidade é refletida nas demais telas pelo `consultorioStore`. |

### Painel geral (Tela 02)

**Responsável:** Rafael Pimentel · **Rota:** `/painel` · **Acesso:** autenticado.

Entidades: indicadores de Sessões, Pacientes e Prontuários do psicólogo autenticado. Estados: carregamento, dia sem atendimentos e erro.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F05** | Indicadores do psicólogo | Cartões de pacientes ativos, sessões no mês, atendimentos de hoje e prontuários atualizados nos últimos 7 dias, restritos ao psicólogo autenticado. |
| **RF-F06** | Atendimentos de hoje | Tabela com horário, paciente, modalidade e status. Ver agenda leva à Agenda e consultas. |
| **RF-F07** | Ritmo do mês | Gráfico semanal, destaque da semana de maior volume e resumo de sessões concluídas e pendentes. |
| **RF-F08** | Atalho para a agenda | Botão Abrir agenda, trilha de navegação e data atual na barra superior. |

### Login (Tela 03)

**Responsável:** Ruan Ricardo · **Rota:** `/login` · **Acesso:** público.

Estados: carregando, credenciais inválidas, erro de conexão e links para Redefinir senha e Criar conta.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F09** | Autenticar usuário | Formulário de e-mail e senha com validação e progresso. Falhas não indicam qual credencial errou. No sucesso, preenche o `authStore` e abre o Painel ou a rota originalmente solicitada. |
| **RF-F10** | Encerrar sessão | Sair encerra a sessão, limpa o `authStore` e o cache do TanStack Query e redireciona para `/login`. |

### Redefinir senha (Tela 04)

**Responsável:** Ruan Ricardo · **Rota:** `/redefinir-senha` · **Acesso:** público.

Estados: formulário de e-mail, link enviado e erro de envio.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F11** | Solicitar link de redefinição | Valida o e-mail, mostra progresso e confirma o envio com mensagem neutra, sem revelar se o endereço existe. Voltar ao login permanece disponível. |

### Pacientes (Tela 05)

**Responsável:** Richard Silva · **Rotas:** `/pacientes`, `/pacientes/novo`, `/pacientes/[id]` e `/pacientes/[id]/editar` · **Acesso:** autenticado.

Entidade: Pacientes, com CRUD e exclusão lógica. Subtelas: perfil, novo paciente em três etapas, edição, busca vazia e confirmação de desativação.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F12** | Buscar e filtrar pacientes | Busca por nome ou CPF, filtro por status e contador. Sem resultado, oferece limpar filtros. |
| **RF-F13** | Listar pacientes | Tabela paginada com paciente, CPF mascarado, contato, última sessão, status, intervalo e ação Ver perfil. |
| **RF-F14** | Visualizar perfil e sessões | Exibe dados e histórico de sessões, com atalhos para Agenda e Prontuário. |
| **RF-F15** | Cadastrar e editar paciente | Formulário em três etapas com progresso, validação e preservação dos dados ao voltar. A edição reutiliza o formulário. Salvar confirma e invalida a lista. |
| **RF-F16** | Desativar e reativar paciente | Exclusão lógica com confirmação. O paciente fica Inativo, mantém registros clínicos e pode ser reativado. |
| **RF-F17** | Restringir a lista ao psicólogo | Exibe apenas pacientes sob responsabilidade do psicólogo autenticado ou vinculados a ele. |
| **RF-F18** | Validar CPF | Valida formato e dígitos, aplica máscara e informa duplicidade no próprio campo. |
| **RF-F19** | Proteger dados pessoais | O CPF fica mascarado na lista e completo apenas no perfil e na edição. |

### Prontuário e CID (Tela 06)

**Responsável:** Micael Barros · **Rotas:** `/prontuario` e `/prontuario/[pacienteId]` · **Acesso:** psicólogos vinculados ao paciente.

Entidades: Prontuários e Evoluções. Estados: sem paciente, prontuário, busca de CID, acesso negado, carregando e erro.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F20** | Selecionar paciente | Seletor de pacientes vinculados. A escolha atualiza a rota e carrega o prontuário. |
| **RF-F21** | Buscar CID | Busca por código ou descrição e permite associar o resultado ao registro clínico. |
| **RF-F22** | Editar registro clínico | Edita anamnese, observações e CID, com salvamento e confirmação. |
| **RF-F23** | Registrar evolução clínica | Cria evolução vinculada a uma sessão concluída e a inclui no histórico. |
| **RF-F24** | Consultar histórico de evoluções | Lista cronológica somente para leitura. Evoluções não podem ser editadas nem excluídas. |
| **RF-F25** | Tratar acesso negado | Não exibe dados clínicos e oferece retorno à seleção do paciente. |

### Agenda e consultas (Tela 07)

**Responsável:** Richard Silva · **Rota:** `/agenda` · **Acesso:** autenticado.

Entidade: Sessões, com CRUD. Estados: agendar, editar e pagar, confirmar cancelamento, agenda vazia, feriado e conflito.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F26** | Agendar sessão | Informa paciente vinculado, data, horário, modalidade e valor sugerido pelo consultório. Salvar atualiza a agenda. |
| **RF-F27** | Editar, remarcar e cancelar | Edita dados, remarca e registra pagamento. Cancelar exige confirmação e mantém o registro como cancelado. |
| **RF-F28** | Visualizar agenda semanal | Grade de segunda a sexta com cartões, intervalo, número da semana, navegação e botão Hoje. |
| **RF-F29** | Agenda sem resultados | Oferece agendar uma sessão ou limpar os filtros. |
| **RF-F30** | Filtrar a agenda | Filtros combináveis por paciente e status. |
| **RF-F31** | Impedir conflito de horário | Bloqueia horário já ocupado pelo mesmo psicólogo e informa o conflito no formulário. |
| **RF-F32** | Concluir consulta | A conclusão habilita o registro de evolução em Prontuário e CID. |
| **RF-F38** | Aviso de feriado | Exibe aviso informativo quando a data escolhida coincide com feriado. |

### Criar conta (Tela 08)

**Responsável:** Ruan Ricardo · **Rota:** `/criar-conta` · **Acesso:** público.

Entidade: Psicólogo. Estados: formulário, erros por campo, duplicidade de CRP ou e-mail, carregando e sucesso.

| ID | Requisito | Descrição |
|---|---|---|
| **RF-F39** | Cadastrar psicólogo | Formulário com nome, CRP, e-mail e senha, com progresso no botão Criar conta. |
| **RF-F40** | Validar campos | Valida CRP, e-mail e senha com no mínimo 8 caracteres e mostra mensagens junto aos campos. |
| **RF-F41** | Tratar duplicidade | Mostra duplicidade de CRP ou e-mail no campo afetado. |
| **RF-F42** | Concluir cadastro | Confirma o sucesso e leva o usuário a `/login`. |

## 6. Requisitos não funcionais de front-end

| ID | Requisito | Descrição |
|---|---|---|
| **RNF-F01** | Responsividade | Interface utilizável de 360 px a telas largas; menu recolhível e tabelas com rolagem em telas estreitas. |
| **RNF-F02** | Desempenho percebido | Esqueletos, cache e atualização somente dos dados afetados após mutações. |
| **RNF-F03** | Acessibilidade | Contraste, rótulos, foco visível, teclado e erros associados aos campos. |
| **RNF-F04** | Consistência visual | Uso exclusivo dos tokens da seção 4.5. |
| **RNF-F05** | Proteção de dados | Dados clínicos e pessoais não ficam no `localStorage` nem no estado persistido; CPF mascarado e rotas protegidas. |
| **RNF-F06** | Feedback ao usuário | Toda ação confirma o resultado ou informa o erro em linguagem clara. |
| **RNF-F07** | Compatibilidade | Versões atuais de Chrome, Edge, Firefox e Safari. |
