// O logo da margem (desenho "B1 · Caderno", escolhido pelo time em 26/11): uma
// folha com a linha de margem em lavanda e um ponto no meio, que é você e o seu
// estudo. A borda e a pauta usam o mesmo lavanda clarinho da pauta do
// perfil-diário. As cores vêm das variáveis do tema, então o logo acompanha o
// modo claro e o noturno.
// Em tamanho pequeno (o topo do site) a pauta sai: ali ela virava borrão. O
// ícone da aba, em app/icon.svg, é o mesmo desenho sem a pauta.

export function LogoMargem({
  className = "size-7",
  comPauta = false,
}: {
  className?: string;
  comPauta?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" className={`flex-none ${className}`} aria-hidden>
      <rect
        x="15"
        y="11"
        width="70"
        height="78"
        rx="12"
        className="fill-superficie stroke-destaque"
        strokeOpacity={comPauta ? 0.5 : 0.6}
        strokeWidth={comPauta ? 4 : 6}
      />
      {comPauta && (
        <>
          <line x1="32" y1="36" x2="85" y2="36" className="stroke-destaque" strokeOpacity={0.35} strokeWidth={4} />
          <line x1="32" y1="64" x2="85" y2="64" className="stroke-destaque" strokeOpacity={0.35} strokeWidth={4} />
        </>
      )}
      <line x1="33" y1="11" x2="33" y2="89" className="stroke-destaque" strokeWidth={comPauta ? 6 : 9} />
      <circle cx="59" cy="50" r={comPauta ? 9 : 11} className="fill-tinta" />
    </svg>
  );
}
