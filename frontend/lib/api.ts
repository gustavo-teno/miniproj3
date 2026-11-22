// Fetch tipado, único ponto de contato com o backend.
// Já preparado para receber o token da auth (guia 01, Parte 2).

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  // Parte 2 do guia 01: leia o token salvo no login e envie em Authorization.

  // Atalho de desenvolvimento (guia 01, Passo 0): enquanto o login não existe,
  // NEXT_PUBLIC_DEV_USER_ID no .env.local diz "finja que sou o usuário N".
  // O prefixo NEXT_PUBLIC_ é o que deixa a variável chegar ao navegador. No
  // deploy ela não existe, e o backend sem DEBUG ignora o header de todo jeito.
  const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  if (devUserId) h["X-User-Id"] = devUserId;
  return h;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  // 401 com token salvo = token que não vale mais (ex.: o banco foi apagado ou o
  // servidor do deploy reiniciou). Joga o token fora e volta para o login.
  if (res.status === 401 && typeof window !== "undefined" && localStorage.getItem("token")) {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") window.location.href = "/login";
  }

  if (!res.ok) {
    // 422 = corpo inválido; 409 = conflito (ex.: username repetido). Ver guia 04.
    const erro = await res.json().catch(() => null);
    const detail = typeof erro?.detail === "string" ? erro.detail : null;
    throw new Error(detail ?? `${method} ${path} → ${res.status}`);
  }

  // 204 No Content (seguir, curtir, apagar...) não tem corpo: não há JSON para ler.
  if (res.status === 204) return undefined as T;
  return res.json();
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
