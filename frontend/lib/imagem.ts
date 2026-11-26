"use client";

// A imagem dos posts de matéria (#105, Pessoa A): reduzir no navegador,
// mandar, buscar e tirar. Fica aqui, e não no lib/api.ts, para o PR mexer o
// mínimo no arquivo da Camila. A imagem vai crua no corpo (não é JSON), e
// buscar devolve os bytes, então estes pedidos não passam pelo apiGet.

import { lerToken } from "@/lib/sessao";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// O lado maior da imagem depois de reduzida e o tamanho que miramos. O
// backend aceita até 600 KB; aqui miramos a metade, para sobrar folga.
const LADO_MAXIMO = 1024;
const TAMANHO_ALVO = 300 * 1024;

function autorizacao(): Record<string, string> {
  const h: Record<string, string> = {};
  const token = lerToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  // O mesmo atalho de desenvolvimento do lib/api.ts (guia 01, Passo 0).
  const devUserId = process.env.NEXT_PUBLIC_DEV_USER_ID;
  if (devUserId) h["X-User-Id"] = devUserId;
  return h;
}

// Uma foto de celular tem 3 a 5 MB. Desenhamos num canvas com o lado maior
// em 1024 px e salvamos em JPEG, baixando a qualidade até caber em ~300 KB.
export async function reduzirImagem(arquivo: File): Promise<Blob> {
  if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    throw new Error("Não foi possível abrir esta imagem. Tente uma foto em JPEG ou PNG.");
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a imagem.");
  // Fundo branco: um PNG transparente não vira preto no JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let qualidade = 0.85;
  let blob = await paraJpeg(canvas, qualidade);
  while (blob.size > TAMANHO_ALVO && qualidade > 0.45) {
    qualidade -= 0.1;
    blob = await paraJpeg(canvas, qualidade);
  }
  return blob;
}

function paraJpeg(canvas: HTMLCanvasElement, qualidade: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Não foi possível preparar a imagem."))),
      "image/jpeg",
      qualidade,
    ),
  );
}

async function pedir(metodo: string, postId: number, corpo?: Blob): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/posts/${postId}/imagem`, {
      method: metodo,
      headers: corpo ? { ...autorizacao(), "Content-Type": corpo.type || "image/jpeg" } : autorizacao(),
      body: corpo,
    });
  } catch {
    throw new Error("Não foi possível falar com o servidor. Tente de novo em breve.");
  }
  if (!res.ok) {
    const erro = await res.json().catch(() => null);
    const detalhe = typeof erro?.detail === "string" ? erro.detail : null;
    // O padrão das telas: maiúscula e ponto final.
    throw new Error(
      detalhe
        ? detalhe.charAt(0).toUpperCase() + detalhe.slice(1) + "."
        : `Não foi possível concluir o pedido (erro ${res.status}).`,
    );
  }
  return res;
}

export async function enviarImagem(postId: number, imagem: Blob): Promise<void> {
  await pedir("PUT", postId, imagem);
}

export async function tirarImagem(postId: number): Promise<void> {
  await pedir("DELETE", postId);
}

// Devolve um endereço local (blob:) para o <img>. Quem usa chama
// URL.revokeObjectURL quando a imagem sai da tela.
export async function buscarImagem(postId: number): Promise<string> {
  const res = await pedir("GET", postId);
  return URL.createObjectURL(await res.blob());
}
