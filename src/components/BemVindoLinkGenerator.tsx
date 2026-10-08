import { useState } from "react";
import { Link2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ONBOARDING, OBJETIVOS, buildBemVindoUrl, type Objetivo } from "@/config/onboarding";

// Gerador de link da página padronizada /bem-vindo: nome + objetivo → URL e
// mensagem de WhatsApp pronta pra colar.
const BemVindoLinkGenerator = () => {
  const [nome, setNome] = useState("");
  const [obj, setObj] = useState<Objetivo | "">("");

  const url = buildBemVindoUrl(window.location.origin, nome, obj);
  const primeiroNome = nome.trim().split(/\s+/)[0] || "";
  const mensagem = ONBOARDING.mensagemWhatsapp
    .replace("{nome}", primeiroNome || "tudo certo")
    .replace("{link}", url);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado!`);
    } catch {
      toast.error("Não consegui copiar — selecione e copie manualmente.");
    }
  };

  return (
    <div className="mb-8 p-5 rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Link2 className="w-4 h-4 text-gold-dark" />
        <h2 className="font-semibold text-foreground">Link de boas-vindas padronizado</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Sem criar página: preencha o nome e o objetivo, copie a mensagem e mande no WhatsApp.
      </p>
      <div className="grid sm:grid-cols-[1fr_220px] gap-3 mb-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do aluno"
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground"
        />
        <select
          value={obj}
          onChange={(e) => setObj(e.target.value as Objetivo | "")}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground"
        >
          <option value="">Objetivo (opcional)</option>
          {OBJETIVOS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="text-xs font-mono break-all px-3 py-2 rounded-md bg-secondary/50 text-foreground mb-3">{url}</div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => copy(mensagem, "Mensagem")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all"
        >
          <Copy className="w-4 h-4" /> Copiar mensagem do WhatsApp
        </button>
        <button
          onClick={() => copy(url, "Link")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-secondary/50"
        >
          <Copy className="w-4 h-4" /> Copiar só o link
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm text-foreground hover:bg-secondary/50"
        >
          <ExternalLink className="w-4 h-4" /> Ver página
        </a>
      </div>
    </div>
  );
};

export default BemVindoLinkGenerator;
