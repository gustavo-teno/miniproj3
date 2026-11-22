// Como o card escreve o tempo. Num lugar só para o feed, o perfil e as turmas
// mostrarem igual.

// Há quanto tempo: com menos de 1 hora, só os minutos ("há 25min"); depois,
// só as horas ("há 2h"); depois de um dia, os dias ("há 1d").
export function tempoDesde(iso: string, agora: Date = new Date()): string {
  const minutos = Math.max(0, Math.floor((agora.getTime() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos}min`;
  if (minutos < 24 * 60) return `há ${Math.floor(minutos / 60)}h`;
  return `há ${Math.floor(minutos / (24 * 60))}d`;
}

// Duração da sessão de estudo: 90 → "1h30", 120 → "2h", 45 → "45min".
export function duracao(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m}min`;
}

// A data completa, para aparecer ao passar o mouse: "22/11/2026, 18:41".
export function dataCompleta(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
