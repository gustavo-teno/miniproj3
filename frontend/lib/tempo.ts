// Como o card escreve o tempo. Num lugar só para o feed, o perfil e as turmas
// mostrarem igual.

// Há quanto tempo: com menos de 1 hora, só os minutos ("há 25min"); depois,
// só as horas ("há 2h"). Com 1 dia ou mais, a data, como no Twitter, sempre
// em números (combinado em 24/11): "22/11", e "22/11/2025" se for de outro ano.
export function tempoDesde(iso: string, agora: Date = new Date()): string {
  const quando = new Date(iso);
  const minutos = Math.max(0, Math.floor((agora.getTime() - quando.getTime()) / 60000));
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos}min`;
  if (minutos < 24 * 60) return `há ${Math.floor(minutos / 60)}h`;
  const dia = String(quando.getDate()).padStart(2, "0");
  const mes = String(quando.getMonth() + 1).padStart(2, "0");
  return quando.getFullYear() === agora.getFullYear() ? `${dia}/${mes}` : `${dia}/${mes}/${quando.getFullYear()}`;
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
