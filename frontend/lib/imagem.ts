"use client";

// A imagem dos posts de matéria (#105, Pessoa A): reduzir no navegador,
// mandar, buscar e tirar. A imagem vai crua no corpo (não é JSON), e buscar
// devolve os bytes, então estes pedidos usam o pedirAoBackend do lib/api.ts
// direto, e não o apiGet (o token e as mensagens de erro são os mesmos).

import { pedirAoBackend, type Post } from "@/lib/api";

// O lado maior da imagem depois de reduzida e o tamanho que miramos. O
// backend aceita até 600 KB; aqui miramos a metade, para sobrar folga.
const LADO_MAXIMO = 1024;
const TAMANHO_ALVO = 300 * 1024;

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

// Manda a imagem e devolve o tamanho dela: o post novo já aparece com a caixa
// da foto no formato certo (#127), como os que vêm do backend.
export async function enviarImagem(
  postId: number,
  imagem: Blob,
): Promise<Pick<Post, "imagem_largura" | "imagem_altura">> {
  await pedirAoBackend("PUT", `/posts/${postId}/imagem`, {
    corpo: imagem,
    tipo: imagem.type || "image/jpeg",
  });
  // Se não der para medir, a caixa fica em 4:3: a imagem já subiu, não é erro.
  const bitmap = await createImageBitmap(imagem).catch(() => null);
  const tamanho = { imagem_largura: bitmap?.width ?? null, imagem_altura: bitmap?.height ?? null };
  bitmap?.close();
  return tamanho;
}

export async function tirarImagem(postId: number): Promise<void> {
  await pedirAoBackend("DELETE", `/posts/${postId}/imagem`);
}

// Devolve um endereço local (blob:) para o <img>. Quem usa chama
// URL.revokeObjectURL quando a imagem sai da tela.
export async function buscarImagem(postId: number): Promise<string> {
  // O backend deixa o navegador guardar a imagem por 5 minutos: rolar o feed
  // para cima e para baixo não baixa a mesma imagem de novo.
  const res = await pedirAoBackend("GET", `/posts/${postId}/imagem`, { cache: "default" });
  return URL.createObjectURL(await res.blob());
}
