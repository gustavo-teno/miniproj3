// /mensagens sem conversa aberta. A lista mora no layout (#91). No computador,
// a coluna da direita fica com este convite; no celular, o layout esconde
// esta página e mostra só a lista.

export default function MensagensPage() {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div>
        <p className="font-semibold">Escolha uma conversa</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-tinta-suave">
          Clique em alguém da lista para ler e responder aqui do lado.
        </p>
      </div>
    </div>
  );
}
