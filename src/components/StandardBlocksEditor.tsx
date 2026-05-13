import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ChevronDown, ChevronRight, Trash2, Activity, Utensils, Dumbbell, Target, Brain, BookOpen, GripVertical } from "lucide-react";
import ImageUpload from "./ImageUpload";
import type { StandardBlocksData, StandardBlock, AreaMembrosBlock, StandardBlockKey } from "@/pages/CreatePage";

const META: Record<StandardBlockKey, { label: string; icon: React.ReactNode; helper: string }> = {
  bioimpedancia: { label: "Bioimpedância", icon: <Activity className="w-4 h-4" />, helper: "Anexe a foto da bioimpedância do aluno." },
  planoAlimentar: { label: "Plano Alimentar (WebDiet)", icon: <Utensils className="w-4 h-4" />, helper: "Foto, texto explicativo, login/senha do WebDiet, links Android/iOS." },
  treino: { label: "Treino (MFit)", icon: <Dumbbell className="w-4 h-4" />, helper: "Foto, texto explicativo, login/senha do MFit, links Android/iOS." },
  checkins: { label: "Check-ins", icon: <Target className="w-4 h-4" />, helper: "Anexe a foto explicando os check-ins." },
  psicologa: { label: "Psicóloga", icon: <Brain className="w-4 h-4" />, helper: "Anexe a foto da psicóloga." },
  areaMembros: { label: "Área de Membros", icon: <BookOpen className="w-4 h-4" />, helper: "Texto + link da área de membros (abre modal com botão de acesso)." },
};

const KEYS_WITH_CREDS: StandardBlockKey[] = ["planoAlimentar", "treino"];
const KEYS_WITH_LINKS: StandardBlockKey[] = ["planoAlimentar", "treino"];
const KEYS_WITH_IMAGE: StandardBlockKey[] = ["bioimpedancia", "planoAlimentar", "treino", "checkins", "psicologa"];
const KEYS_WITH_DESCRIPTION: StandardBlockKey[] = ["planoAlimentar", "treino", "areaMembros"];

interface Props {
  value: StandardBlocksData;
  onChange: (next: StandardBlocksData) => void;
  order: StandardBlockKey[];
  onOrderChange: (next: StandardBlockKey[]) => void;
}

const StandardBlocksEditor = ({ value, onChange, order, onOrderChange }: Props) => {
  const [openKey, setOpenKey] = useState<StandardBlockKey | null>(null);

  const updateBlock = (key: StandardBlockKey, patch: Partial<StandardBlock & AreaMembrosBlock>) => {
    onChange({ ...value, [key]: { ...value[key], ...patch } });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;
    const next = Array.from(order);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onOrderChange(next);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="standard-blocks">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {order.map((key, index) => {
              const block = value[key];
              const meta = META[key];
              const isOpen = openKey === key;
              return (
                <Draggable key={key} draggableId={key} index={index}>
                  {(prov, snapshot) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      className={`rounded-lg border transition-colors ${snapshot.isDragging ? "bg-secondary border-gold shadow-gold ring-1 ring-gold/50" : block.enabled ? "border-gold/30 bg-card" : "border-border bg-background"}`}
                    >
                      <div className="flex items-center gap-2 p-3">
                        <div {...prov.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold p-1 -ml-1" title="Arrastar para reordenar">
                          <GripVertical className="w-4 h-4" />
                        </div>
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

                              {KEYS_WITH_DESCRIPTION.includes(key) && (
                                <div>
                                  <label className="text-xs text-muted-foreground font-medium">Texto explicativo (aparece no modal)</label>
                                  <textarea
                                    value={(block as any).description || ""}
                                    onChange={(e) => updateBlock(key, { description: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground resize-y"
                                    placeholder={key === "areaMembros" ? "Ex: Acesse os módulos e materiais complementares." : "Ex: Instruções de uso, observações, etc."}
                                    rows={3}
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
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default StandardBlocksEditor;
