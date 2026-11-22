// O token do login (guia 01, Parte 2): guardado no localStorage para não se
// perder ao recarregar a página. Só este arquivo mexe nele.

const CHAVE = "token";

// Navegação anônima pode bloquear o localStorage: aí é como não ter token.
export function lerToken(): string | null {
  if (typeof window === "undefined") return null; // no servidor não há navegador
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function salvarToken(token: string): void {
  try {
    localStorage.setItem(CHAVE, token);
  } catch {
    // Sem localStorage o login vale só até recarregar a página.
  }
}

export function apagarToken(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    // Sem localStorage não havia token salvo.
  }
}
