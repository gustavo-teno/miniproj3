// Fetch tipado, único ponto de contato com o backend.

import { apagarToken, lerToken, salvarToken } from "@/lib/sessao";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
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

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: headers(),
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
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
};

// GET /usuarios/{username}: a meta (decisão 2) e os contadores do follow (D).
export type Perfil = User & {
  vestibular: string; // chave de /opcoes, ou "" se não escolheu
  curso: string;
  vestibular_outro: string; // texto livre, só quando escolheu "outro"
  curso_outro: string;
  universidade: string;
  seguidores: number;
  seguindo: number;
};

// ---- ofensiva (#7, Pessoa A; espelha backend/app/schemas/ofensiva.py) ----

export type Ofensiva = {
  atual: number; // dias seguidos de estudo (folga mantém, mas não soma)
  recorde: number;
  folgas_usadas_na_semana: number;
  folgas_por_semana: number;
  precisa_estudar_hoje: boolean; // sem post de matéria hoje, a ofensiva quebra
  minutos_esta_semana: number;
  minutos_semana_passada: number;
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
export type ConversaAberta = {
  pessoa: Autor;
  pode_responder: boolean; // só entre mútuos (decisão 6)
  mensagens: Mensagem[];
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

export function enviarMensagem(username: string, texto: string): Promise<Mensagem> {
  return apiPost<Mensagem>(`/dms/${encodeURIComponent(username)}`, { texto });
}
