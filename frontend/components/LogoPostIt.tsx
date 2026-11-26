// O logo do Post-it (#98, desenho "C · A pilha de bilhetes"): três post-its
// empilhados. Os de trás têm as cores das matérias (cada pessoa deixa o seu);
// o da frente é lavanda, com o canto dobrado dos posts. As cores são as mesmas
// no claro e no noturno: os tons pastel aparecem bem nos dois fundos.
// O mesmo desenho está em app/icon.svg, o ícone da aba.

export function LogoPostIt({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`flex-none ${className}`} aria-hidden>
      <rect x="22" y="2" width="36" height="36" rx="4" fill="#bdffcd" transform="rotate(10 40 20)" />
      <rect x="12" y="10" width="36" height="36" rx="4" fill="#c9dcff" transform="rotate(-8 30 28)" />
      <path d="M4 22h36l10 10v30H4z" fill="#c9bdf0" />
      <path d="M40 22v10h10z" fill="#7263b0" />
    </svg>
  );
}
