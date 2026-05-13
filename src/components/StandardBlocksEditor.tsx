import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Trash2, Activity, Utensils, Dumbbell, Target, Brain, BookOpen } from "lucide-react";
import ImageUpload from "./ImageUpload";
import type { StandardBlocksData, StandardBlock, AreaMembrosBlock } from "@/pages/CreatePage";

type BlockKey = "bioimpedancia" | "planoAlimentar" | "treino" | "checkins" | "psicologa" | "areaMembros";

const META: Record<BlockKey, { label: string; icon: React.ReactNode; helper: string }> = {
  bioimpedancia: { label: "Bioimpedância", icon: <Activity className="w-4 h-4" />, helper: "Anexe a foto da bioimpedância do aluno." },
  planoAlimentar: { label: "Plano Alimentar (WebDiet)", icon: <Utensils className="w-4 h-4" />, helper: "Foto, login/senha do WebDiet, links Android/iOS." },
  treino: { label: "Treino (MFit)", icon: <Dumbbell className="w-4 h-4" />, helper: "Foto, login/senha do MFit, links Android/iOS." },
  checkins: { label: "Check-ins", icon: <Target className="w-4 h-4" />, helper: "Anexe a foto explicando os check-ins." },
  psicologa: { label: "Psicóloga", icon: <Brain className="w-4 h-4" />, helper: "Anexe a foto da psicóloga." },
  areaMembros: { label: "Área de Membros", icon: <BookOpen className="w-4 h-4" />, helper: "Botão direto para o link da área de membros (sem modal)." },
};

const ORDER: BlockKey[] = ["bioimpedancia", "planoAlimentar", "treino", "checkins", "psicologa", "areaMembros"];

const KEYS_WITH_CREDS: BlockKey[] = ["planoAlimentar", "treino"];
const KEYS_WITH_LINKS: BlockKey[] = ["planoAlimentar", "treino"];
const KEYS_WITH_IMAGE: BlockKey[] = ["bioimpedancia", "planoAlimentar", "treino", "checkins", "psicologa"];

interface Props {
  value: StandardBlocksData;
  onChange: (next: StandardBlocksData) => void;
}

const StandardBlocksEditor = ({ value, onChange }: Props) => {
  const [openKey, setOpenKey] = useState<BlockKey | null>(null);

  const updateBlock = (key: BlockKey, patch: Partial<StandardBlock & AreaMembrosBlock>) => {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  };

  return (
    <div className="space-y-3">
      {ORDER.map((key) => {
        const block = value[key];
        const meta = META[key];
        const isOpen = openKey === key;
        return (
          <div key={key} className={`rounded-lg border ${block.enabled ? "border-gold/30 bg-card" : "border-border bg-background"}`}>
            <div className="flex items-center gap-2 p-3">
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="p-1 hover:bg-secondary rounded-md text-muted-foreground"
                title={isOpen ? "Recolher" : "Expandir"}
              >
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <div className="text-gold">{meta.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{meta.label}</div>
                {!isOpen && <div className="text-xs text-muted-foreground truncate">{meta.helper}</div>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <span className="text-xs text-muted-foreground">{block.enabled ? "Ativo" : "Oculto"}</span>
                <input
                  type="checkbox"
                  checked={block.enabled}
                  onChange={(e) => updateBlock(key, { enabled: e.target.checked })}
                  className="w-5 h-5 rounded accent-gold"
                />
              </label>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-2 border-t border-border space-y-3">
                    <p className="text-xs text-muted-foreground">{meta.helper}</p>

                    {KEYS_WITH_IMAGE.includes(key) && (
                      <div className="space-y-2">
                        {(block as StandardBlock).imageUrl && (
                          <div className="relative w-full max-w-xs rounded-lg overflow-hidden border border-border">
                            <img src={(block as StandardBlock).imageUrl} alt={meta.label} className="w-full h-32 object-cover" />
                            <button
                              type="button"
                              onClick={() => updateBlock(key, { imageUrl: "" })}
                              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white"
                              title="Remover imagem"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <ImageUpload
                          label={(block as StandardBlock).imageUrl ? "Trocar Imagem" : "Adicionar Imagem"}
                          onUpload={(url) => updateBlock(key, { imageUrl: url })}
                        />
                      </div>
                    )}

                    {KEYS_WITH_CREDS.includes(key) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">Login</label>
                          <input
                            value={(block as StandardBlock).login || ""}
                            onChange={(e) => updateBlock(key, { login: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">Senha {key === "planoAlimentar" && <span className="text-[10px]">(opcional)</span>}</label>
                          <input
                            value={(block as StandardBlock).password || ""}
                            onChange={(e) => updateBlock(key, { password: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                            placeholder="Senha"
                          />
                        </div>
                      </div>
                    )}

                    {KEYS_WITH_LINKS.includes(key) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">Link Android</label>
                          <input
                            value={(block as StandardBlock).androidUrl || ""}
                            onChange={(e) => updateBlock(key, { androidUrl: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                            placeholder="https://play.google.com/..."
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground font-medium">Link iOS</label>
                          <input
                            value={(block as StandardBlock).iosUrl || ""}
                            onChange={(e) => updateBlock(key, { iosUrl: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                            placeholder="https://apps.apple.com/..."
                          />
                        </div>
                      </div>
                    )}

                    {key === "areaMembros" && (
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">URL da Área de Membros</label>
                        <input
                          value={(block as AreaMembrosBlock).url || ""}
                          onChange={(e) => updateBlock(key, { url: e.target.value })}
                          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default StandardBlocksEditor;
