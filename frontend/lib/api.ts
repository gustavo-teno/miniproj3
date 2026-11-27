// Fetch tipado, único ponto de contato com o backend.

import { apagarToken, lerToken, salvarToken } from "@/lib/sessao";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function headers(tipo: string): HeadersInit {
  const h: Record<string, string> = { "Content-Type": tipo };
  // O token do login (guia 01, Passo 4): é ele que diz ao backend quem é você.
  const token = lerToken();
  if (token) h["Authorization"] = `Bearer ${token}`;

  // Atalho de desenvolvimento (guia 01, Passo 0): para testar sem fazer login,
  // NEXT_PUBLIC_DEV_USER_ID no .env.local diz "finja que sou o usuário N".
  // Se houver token, o backend usa o token e ignora este header.
  // O prefixo NEXT_PUBLIC_ é o que deixa a variável chegar ao navegador. No
  // deploy ela não existe, e o backend sem DEBUG ignora o header de todo jeito.
  const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  if (devUserId) h["X-User-Id"] = devUserId;
  return h;
}

// O pedido ao backend e o tratamento das falhas, em um lugar só. O corpo vai
// como veio: o request abaixo manda JSON, e o lib/imagem.ts manda os bytes da
// imagem. Devolve a resposta, para quem chama ler JSON ou bytes.
export async function pedirAoBackend(
  method: string,
  path: string,
  { corpo, tipo = "application/json", cache = "no-store" }: { corpo?: BodyInit; tipo?: string; cache?: RequestCache } = {},
): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers: headers(tipo), body: corpo, cache });
  } catch {
    // Sem resposta nenhuma (backend fora do ar, internet caiu). O navegador
    // diria "Failed to fetch", em inglês e sem explicar nada.
    throw new Error("Não foi possível falar com o servidor. Tente de novo em breve.");
  }

  // 401 com token salvo = token que não vale mais (ex.: o banco foi apagado ou o
  // servidor do deploy reiniciou). Joga o token fora e volta para o login.
  if (res.status === 401 && lerToken()) {
    apagarToken();
    if (window.location.pathname !== "/login") window.location.href = "/login";
  }

  if (!res.ok) {
    // 422 = corpo inválido; 409 = conflito (ex.: username repetido). Ver guia 04.
    const erro = await res.json().catch(() => null);
    throw new Error(mensagemDoErro(erro?.detail) ?? `Não foi possível concluir o pedido (erro ${res.status}).`);
  }
  return res;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await pedirAoBackend(method, path, {
    corpo: body === undefined ? undefined : JSON.stringify(body),
  });
  // 204 No Content (seguir, curtir, apagar...) não tem corpo: não há JSON para ler.
  if (res.status === 204) return undefined as T;
  return res.json();
}

// O "detail" do FastAPI é um texto (erros nossos, como o 409) ou, no 422, uma
// lista de campos com problema, com as mensagens do Pydantic em inglês. Da
// lista, mostra o primeiro problema, traduzido. Toda mensagem sai no padrão
// das telas: impessoal, com maiúscula e ponto final.
function mensagemDoErro(detail: unknown): string | null {
  if (typeof detail === "string") return frase(detail);
  if (Array.isArray(detail) && detail[0]) return frase(traduzir(detail[0]));
  return null;
}

// Um problema de campo, no formato do Pydantic (o que importa dele).
type ProblemaDeCampo = {
  type?: string; // ex.: "string_too_short"
  loc?: (string | number)[]; // ex.: ["body", "name"]
  msg?: string; // a mensagem em inglês, ou a nossa depois de "Value error, "
  ctx?: { min_length?: number; max_length?: number; ge?: number; le?: number };
};

// O nome de cada campo como a tela mostra. Campo novo sem nome aqui aparece
// como "Este campo".
const NOMES_DOS_CAMPOS: Record<string, string> = {
  username: "Nome de usuário",
  name: "Nome",
  password: "Senha",
  universidade: "Universidade",
  vestibular_outro: "Vestibular",
  curso_outro: "Curso",
  texto: "Texto",
  minutos: "Duração",
  bio: "Bio",
  avatar_url: "Foto",
};

// A unidade dos campos de número, para "pelo menos 1 minuto" em vez de "pelo
// menos 1". Campo sem unidade aqui mostra só o número.
const UNIDADES: Record<string, [singular: string, plural: string]> = {
  minutos: ["minuto", "minutos"],
};

function traduzir(p: ProblemaDeCampo): string {
  const chave = String(p.loc?.at(-1) ?? "");
  const campo = NOMES_DOS_CAMPOS[chave] ?? "Este campo";
  // Sem adjetivo ("obrigatório", "vazio"), a frase serve para campo masculino
  // e feminino: "Preencha o campo Senha." (DESIGN.md, mensagens do sistema).
  const preencha = chave in NOMES_DOS_CAMPOS ? `Preencha o campo ${campo}` : "Preencha este campo";
  const numero = (n: number | undefined) => {
    const unidade = UNIDADES[chave];
    return unidade ? `${n} ${n === 1 ? unidade[0] : unidade[1]}` : `${n}`;
  };
  const ctx = p.ctx ?? {};
  switch (p.type) {
    case "missing":
      return preencha;
    case "string_too_short":
      return ctx.min_length === 1
        ? preencha
        : `${campo} precisa ter pelo menos ${ctx.min_length} caracteres`;
    case "string_too_long":
      return `${campo} pode ter no máximo ${ctx.max_length} caracteres`;
    case "string_pattern_mismatch":
      return chave === "username"
        ? "Nome de usuário só aceita letras minúsculas sem acento, números e _"
        : `${campo} tem caracteres que não são aceitos`;
    case "greater_than_equal":
      return `${campo} precisa ser de pelo menos ${numero(ctx.ge)}`;
    case "less_than_equal":
      return `${campo} pode ser de no máximo ${numero(ctx.le)}`;
    case "value_error":
      // Mensagem escrita por nós no backend (ex.: "esse nome de usuário é reservado").
      return (p.msg ?? "").replace(/^Value error, /, "");
    default:
      return `${campo} está com um valor que não é aceito`;
  }
}

// "usuário ou senha inválidos" → "Usuário ou senha inválidos."
function frase(texto: string): string {
  const t = texto.trim();
  if (!t) return "Não foi possível concluir o pedido.";
  const comMaiuscula = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(comMaiuscula) ? comMaiuscula : `${comMaiuscula}.`;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

// ---- tipos do slice de exemplo (espelham backend/app/schemas/user.py) ----

export type User = {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
};

export type Page<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

// ---- quem está usando (GET /auth/eu: aceita o token do login e o X-User-Id) ----

export type Eu = { id: number; username: string };

export function buscarEu(): Promise<Eu> {
  return apiGet<Eu>("/auth/eu");
}

// ---- auth (#6, Pessoa A; espelha backend/app/schemas/auth.py) ----

export type Cadastro = {
  username: string;
  name: string;
  password: string;
  // A meta, opcional: chaves de /opcoes, ou "" se a pessoa não escolheu.
  vestibular: string;
  curso: string;
  vestibular_outro: string; // texto livre, só quando escolheu "outro"
  curso_outro: string;
  universidade: string;
};

export async function entrar(username: string, password: string): Promise<void> {
  const { token } = await apiPost<{ token: string }>("/auth/login", { username, password });
  salvarToken(token);
}

// Cria a conta e já entra, para a pessoa não digitar a senha duas vezes.
// Devolve false se a conta foi criada mas o login logo depois falhou: aí a
// tela não pode mostrar erro, senão a pessoa tenta de novo e recebe
// "username já existe". Erro no cadastro em si continua sendo lançado.
export async function cadastrar(dados: Cadastro): Promise<boolean> {
  await apiPost<User>("/auth/registro", dados);
  try {
    await entrar(dados.username, dados.password);
    return true;
  } catch {
    return false;
  }
}

// Apaga a sessão no backend e o token no navegador. Se o backend falhar (fora
// do ar, token que já não valia), o token sai do navegador do mesmo jeito.
export async function sair(): Promise<void> {
  try {
    if (lerToken()) await apiPost<void>("/auth/logout");
  } finally {
    apagarToken();
  }
}

// ---- listas fixas do contrato (GET /opcoes, backend/app/constantes.py) ----

export type Opcao = { valor: string; nome: string };

export type Opcoes = {
  tags: Opcao[];
  vestibulares: Opcao[];
  cursos: Opcao[];
};

// ---- busca (#38, Pessoa A; espelha backend/app/routers/busca.py) ----

// Sem diferença de acento nem de maiúscula: "calculo" acha "Cálculo".
// O backend só busca a partir de 2 letras.
export function buscarPessoas(q: string): Promise<Page<User>> {
  return apiGet<Page<User>>(`/busca/pessoas?q=${encodeURIComponent(q)}`);
}

export function buscarPosts(q: string): Promise<Page<Post>> {
  return apiGet<Page<Post>>(`/busca/posts?q=${encodeURIComponent(q)}`);
}

// ---- post e perfil (Pessoa B; proposta, fechada nos PRs de posts e perfil) ----

// O autor que aparece no card, sem os dados do perfil inteiro.
export type Autor = Pick<User, "id" | "username" | "name" | "avatar_url">;

// O PostOut do backend. A Pessoa C acrescenta curtidas e comentários.
export type Post = {
  id: number;
  autor: Autor;
  texto: string;
  tag: string; // chave de /opcoes, ex.: "matematica" ou "bate-papo"
  minutos: number | null; // duração da sessão de estudo, opcional
  created_at: string;
  curtidas: number;
  comentarios: number;
  curtido_por_mim: boolean; // depende de quem está vendo
  salvo_por_mim: boolean; // idem, para o botão Salvar (#64)
  tem_imagem?: boolean; // se o post tem imagem (#105): ela vem de lib/imagem.ts
  // O tamanho dela em pixels (#127), para a caixa da foto nascer no formato
  // certo. null se não tem imagem ou se o backend não conseguiu ler.
  imagem_largura?: number | null;
  imagem_altura?: number | null;
};

// Um comentário de GET /posts/{id}/comentarios (#12, Pessoa C), com as
// respostas dentro (comentários em árvore) e as curtidas dele.
export type Comentario = {
  id: number;
  autor: Autor;
  texto: string;
  created_at: string;
  parent_id: number | null; // o comentário que este responde; null se é direto no post
  curtidas: number;
  curtido_por_mim: boolean;
  respostas: Comentario[];
};

// A página de comentários conta só os diretos no post; o total com as
// respostas é o "N comentários" do topo.
export type ComentarioPage = Page<Comentario> & { total_com_respostas: number };

// GET /usuarios/{username}: a meta (decisão 2) e os contadores do follow (D).
export type Perfil = User & {
  vestibular: string; // chave de /opcoes, ou "" se não escolheu
  curso: string;
  vestibular_outro: string; // texto livre, só quando escolheu "outro"
  curso_outro: string;
  universidade: string;
  seguidores: number;
  seguindo: number;
  meu_perfil: boolean; // quem está vendo é a dona do diário?
  cadernos: Caderno[]; // só as tags com post, da mais usada para a menos usada
};

// Um caderno da estante: quantos posts a pessoa tem numa matéria e quando foi o último.
export type Caderno = { tag: string; posts: number; ultimo_post: string };

export function buscarPerfil(username: string): Promise<Perfil> {
  return apiGet<Perfil>(`/usuarios/${encodeURIComponent(username)}`);
}

// O que dá para mudar no próprio perfil (PATCH /usuarios/eu). Só vai o que mudou.
export type EdicaoPerfil = Partial<
  Pick<Perfil, "name" | "bio" | "avatar_url" | "vestibular" | "curso" | "vestibular_outro" | "curso_outro" | "universidade">
>;

// Devolve o perfil inteiro já atualizado.
export function editarPerfil(mudancas: EdicaoPerfil): Promise<Perfil> {
  return apiPatch<Perfil>("/usuarios/eu", mudancas);
}

// Os posts de um caderno (tag) ou de todos (sem tag), do mais novo ao mais antigo.
export function buscarPostsDoPerfil(
  username: string,
  tag: string | null,
  offset = 0,
  limit = 20,
): Promise<Page<Post>> {
  const busca = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (tag) busca.set("tag", tag);
  return apiGet<Page<Post>>(`/usuarios/${encodeURIComponent(username)}/posts?${busca}`);
}

// ---- ofensiva (#7, Pessoa A; espelha backend/app/schemas/ofensiva.py) ----

export type Ofensiva = {
  atual: number; // dias seguidos de estudo (folga mantém, mas não soma)
  recorde: number;
  folgas_usadas_na_semana: number;
  folgas_por_semana: number;
  precisa_estudar_hoje: boolean; // sem post de matéria hoje, a ofensiva quebra
  // As horas são privadas: só vêm para a dona do perfil; para quem visita, null.
  minutos_esta_semana: number | null;
  minutos_semana_passada: number | null;
  minutos_por_dia: number[] | null; // os 7 dias desta semana, de segunda a domingo
};

export function buscarOfensiva(username: string): Promise<Ofensiva> {
  return apiGet<Ofensiva>(`/usuarios/${encodeURIComponent(username)}/ofensiva`);
}

// ---- DMs entre mútuos (#18, Pessoa A; espelha backend/app/schemas/dm.py) ----

export type Mensagem = {
  id: number;
  texto: string;
  created_at: string;
  minha: boolean; // quem está vendo mandou esta mensagem
};

// Um item da lista de conversas.
export type Conversa = { pessoa: Autor; ultima: Mensagem; nao_lidas: number };

// A conversa aberta: as mensagens da mais antiga para a mais nova.
// Um coração numa mensagem (#68): em qual e se foi quem está vendo que curtiu.
export type CurtidaMensagem = { mensagem_id: number; minha: boolean };

export type ConversaAberta = {
  pessoa: Autor;
  pode_responder: boolean; // só entre mútuos (decisão 6)
  mensagens: Mensagem[];
  // Todas as curtidas da conversa, mesmo quando só vêm as mensagens novas.
  curtidas: CurtidaMensagem[];
};

export function buscarConversas(): Promise<Conversa[]> {
  return apiGet<Conversa[]>("/dms");
}

export async function contarNaoLidas(): Promise<number> {
  return (await apiGet<{ total: number }>("/dms/nao-lidas")).total;
}

// Sem depoisDe: as últimas mensagens. Com depoisDe (o id da última que a tela
// já tem): só as novas. Abrir a conversa marca como lido.
export function buscarConversa(username: string, depoisDe?: number): Promise<ConversaAberta> {
  const busca = depoisDe === undefined ? "" : `?depois_de=${depoisDe}`;
  return apiGet<ConversaAberta>(`/dms/${encodeURIComponent(username)}${busca}`);
}

// Para o botão Mensagem do perfil: só entre mútuos. Não abre a conversa, então
// não marca nada como lido.
export async function podeMandarMensagem(username: string): Promise<boolean> {
  return (await apiGet<{ pode_mandar: boolean }>(`/dms/${encodeURIComponent(username)}/pode-mandar`))
    .pode_mandar;
}

export function enviarMensagem(username: string, texto: string): Promise<Mensagem> {
  return apiPost<Mensagem>(`/dms/${encodeURIComponent(username)}`, { texto });
}

// O coração dos dois toques (#68). As duas são idempotentes.
export function curtirMensagem(id: number): Promise<void> {
  return apiPost<void>(`/dms/mensagens/${id}/curtir`);
}

export function descurtirMensagem(id: number): Promise<void> {
  return apiDelete(`/dms/mensagens/${id}/curtir`);
}

// ---- posts salvos (#64, Pessoa A) ----

// Os posts que você salvou, do salvo mais recente para o mais antigo.
export function buscarSalvos(offset = 0, limit = 20): Promise<Page<Post>> {
  return apiGet<Page<Post>>(`/salvos?offset=${offset}&limit=${limit}`);
}

// ---- feed (#16, Pessoa D; espelha backend/app/routers/feed.py) ----

export type FiltrosFeed = {
  materias: string[]; // vazio = todas as matérias
  esconderBatePapo: boolean;
};

// Cronológico, só de quem você segue (decisão 3). O bate-papo não é matéria:
// só o esconderBatePapo decide se ele aparece.
export function buscarFeed(filtros: FiltrosFeed, offset = 0, limit = 20): Promise<Page<Post>> {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  for (const m of filtros.materias) params.append("tag", m);
  if (filtros.esconderBatePapo) params.set("esconder_bate_papo", "true");
  return apiGet<Page<Post>>(`/feed?${params}`);
}

// ---- turmas (#17, Pessoa D; espelha backend/app/schemas/turmas.py) ----

export type TipoTurma = "vestibular" | "curso";

export type Turma = {
  tipo: TipoTurma;
  chave: string; // chave de /opcoes, ex.: "enem"; "outro" é "Outros vestibulares"
  nome: string;
  pessoas: number;
  estudaram_hoje: number; // postaram de matéria hoje (dia de Brasília)
};

export type Turmas = {
  minhas: Turma[]; // a do vestibular e a do curso de quem está vendo
  vestibulares: Turma[];
  cursos: Turma[];
};

// Uma pessoa na aba Chamada. A meta inteira vem junto, para o card mostrar a
// outra turma dela.
export type Membro = Autor & {
  vestibular: string;
  curso: string;
  vestibular_outro: string;
  curso_outro: string;
  universidade: string;
  estudou_hoje: boolean;
  segue_voce: boolean;
};

export function buscarTurmas(): Promise<Turmas> {
  return apiGet<Turmas>("/turmas");
}

// A página da turma no site tem o mesmo endereço da rota na API.
export function enderecoDaTurma(tipo: TipoTurma, chave: string): string {
  return `/turmas/${tipo}/${encodeURIComponent(chave)}`;
}

export function buscarTurma(tipo: TipoTurma, chave: string): Promise<Turma> {
  return apiGet<Turma>(enderecoDaTurma(tipo, chave));
}

export function buscarMembros(tipo: TipoTurma, chave: string, offset = 0, limit = 50): Promise<Page<Membro>> {
  return apiGet<Page<Membro>>(`${enderecoDaTurma(tipo, chave)}/membros?offset=${offset}&limit=${limit}`);
}

// Sem tag, os posts de todas as matérias (e o bate-papo).
export function buscarPostsDaTurma(
  tipo: TipoTurma,
  chave: string,
  tag: string,
  offset = 0,
  limit = 20,
): Promise<Page<Post>> {
  const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  if (tag) params.set("tag", tag);
  return apiGet<Page<Post>>(`${enderecoDaTurma(tipo, chave)}/posts?${params}`);
}
