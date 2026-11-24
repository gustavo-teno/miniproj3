import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Mono, Lexend } from "next/font/google";

import { Navegacao } from "@/components/Navegacao";
import { NOME_REDE, SLOGAN_REDE } from "@/lib/rede";
import "./globals.css";

// Lexend: feita para leitura fluente. 300, 400 e 600 em tudo; 700 só nos
// números do fogo da ofensiva (os dias seguidos e o recorde). A mono deixa
// números (1h30, 45min) e @usuário alinhados e discretos.
const texto = Lexend({ subsets: ["latin"], weight: ["300", "400", "600", "700"], variable: "--fonte-texto" });
const numeros = Atkinson_Hyperlegible_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--fonte-numeros",
  // O Next não tem as medidas dessa fonte para ajustar a reserva e avisava no build.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: NOME_REDE,
  description: `${NOME_REDE}: ${SLOGAN_REDE}`,
};

// Roda antes de a página aparecer: se a pessoa já escolheu um modo no menu de
// configurações, aplica no <html> na hora, para a tela não piscar no modo
// errado. Sem escolha salva, o CSS segue o modo do sistema.
const aplicarTemaSalvo = `try{var t=localStorage.getItem("tema");if(t==="claro"||t==="noturno")document.documentElement.dataset.tema=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: o script acima muda o data-tema antes do React
    // chegar, e sem isso o React reclamaria da diferença.
    <html lang="pt-BR" className={`${texto.variable} ${numeros.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: aplicarTemaSalvo }} />
      </head>
      <body className="min-h-screen bg-fundo font-texto text-tinta">
        <Navegacao />
        <main className="mx-auto max-w-[1320px] px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
