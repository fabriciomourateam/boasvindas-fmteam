/**
 * Renderiza TODAS as seções compartilhadas entre o editor de aluno (CreatePage) e o editor
 * de template (EditTemplate): Estratégia, Próximos Passos, Botões Padrões, Blocos Customizados,
 * Links, Orientações, Imagem Extras (rodapé) e Ordenação das Seções.
 *
 * Mantenha as alterações de UI/comportamento das seções COMUNS aqui — ambas as páginas pegam
 * automaticamente. Campos específicos (Dados do Aluno / Nome do Template) ficam em cada página.
 *
 * Contrato:
 *   - `form` é o estado completo (CreatePage.FormState ou EditTemplate.TemplateForm). Ambos
 *     contêm os campos compartilhados (ver SharedFormShape abaixo).
 *   - `update(key, value)` patch-update um campo do form.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Copy, Eye, EyeOff } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import SortableSections from "@/components/SortableSections";
import SortableCustomBlocks from "@/components/SortableCustomBlocks";
import StandardBlocksEditor from "@/components/StandardBlocksEditor";

export interface SharedFormShape {
  strategy: string;
  steps: Array<{ title: string; description: string }>;
  stepsTitle: string;
  hideStepsTitle: boolean;
  collapsedSteps: Record<number, boolean>;
  standardBlocks: any;
  standardBlocksOrder: any;
  optionalBlocks: any[];
  collapsedOptionalBlocks: Record<number, boolean>;
  membersLink: string;
  whatsappUrl: string;
  links: Array<{ label: string; url: string; icon?: string; description?: string }>;
  guidelinesTitle: string;
  hideGuidelinesTitle: boolean;
  hideHighlightsTitle: boolean;
  guidelinesContent: string;
  guidelinesHighlights: Array<{ title: string; content: string; hidden?: boolean }>;
  collapsedHighlights: Record<number, boolean>;
  extrasImageUrl: string;
  sectionOrder: string[];
  editorCollapse: Record<string, boolean>;
}

interface Props {
  form: SharedFormShape;
  update: (key: string, value: any) => void;
}

/** Default: aberto. Algumas seções começam fechadas pra não poluir. */
const DEFAULT_COLLAPSED: Record<string, boolean> = {
  optionalBlocks: true,
  links: true,
  extras: true,
  sectionOrder: true,
  basicInfo: true,
};

const PageEditorSections = ({ form, update }: Props) => {
  const ec = form.editorCollapse || {};
  const isC = (k: string) => ec[k] ?? DEFAULT_COLLAPSED[k] ?? false;
  const setC = (k: string, val: boolean) => update("editorCollapse", { ...ec, [k]: val });
  const toggleC = (k: string) => setC(k, !isC(k));

  // Aliases mantidos pra minimizar diff
  const isSummaryCollapsed = isC("summary");
  const isStepsCollapsed = isC("steps");
  const isStandardBlocksCollapsed = isC("standardBlocks");
  const isOptionalBlocksCollapsed = isC("optionalBlocks");
  const isLinksCollapsed = isC("links");
  const isGuidelinesCollapsed = isC("guidelines");
  const isExtrasCollapsed = isC("extras");
  const isSectionOrderCollapsed = isC("sectionOrder");
  const setIsSummaryCollapsed = (v: boolean) => setC("summary", v);
  const setIsStepsCollapsed = (v: boolean) => setC("steps", v);
  const setIsStandardBlocksCollapsed = (v: boolean) => setC("standardBlocks", v);
  const setIsOptionalBlocksCollapsed = (v: boolean) => setC("optionalBlocks", v);
  const setIsLinksCollapsed = (v: boolean) => setC("links", v);
  const setIsGuidelinesCollapsed = (v: boolean) => setC("guidelines", v);
  const setIsExtrasCollapsed = (v: boolean) => setC("extras", v);
  const setIsSectionOrderCollapsed = (v: boolean) => setC("sectionOrder", v);
  // Silence "unused" warnings em modo strict (toggleC e useState não usados aqui)
  void toggleC; void useState;

  // ─── Helpers para listas ────────────────────────────────────────────────────
  const addStep = () => update("steps", [...form.steps, { title: "", description: "" }]);
  const removeStep = (i: number) => update("steps", form.steps.filter((_, idx) => idx !== i));
  const duplicateStep = (i: number) => {
    const toClone = form.steps[i];
    const next = [...form.steps];
    next.splice(i + 1, 0, { ...toClone });
    update("steps", next);
  };
  const updateStep = (i: number, field: string, value: string) =>
    update("steps", form.steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const toggleStepCollapse = (i: number) =>
    update("collapsedSteps", { ...form.collapsedSteps, [i]: !form.collapsedSteps[i] });

  const handleDragStep = (result: DropResult) => {
    if (!result.destination) return;
    const sIdx = result.source.index;
    const dIdx = result.destination.index;
    if (sIdx === dIdx) return;
    const next = Array.from(form.steps);
    const [moved] = next.splice(sIdx, 1);
    next.splice(dIdx, 0, moved);
    const newCollapsed: Record<number, boolean> = {};
    next.forEach((_, idx) => {
      let old = idx;
      if (idx === dIdx) old = sIdx;
      else if (sIdx < dIdx && idx >= sIdx && idx < dIdx) old = idx + 1;
      else if (sIdx > dIdx && idx > dIdx && idx <= sIdx) old = idx - 1;
      newCollapsed[idx] = form.collapsedSteps[old] || false;
    });
    update("collapsedSteps", newCollapsed);
    update("steps", next);
  };

  const addHighlight = () =>
    update("guidelinesHighlights", [
      ...form.guidelinesHighlights,
      { title: `Destaque ${form.guidelinesHighlights.length + 1}`, content: "" },
    ]);
  const removeHighlight = (i: number) =>
    update("guidelinesHighlights", form.guidelinesHighlights.filter((_, idx) => idx !== i));
  const toggleHighlightCollapse = (i: number) =>
    update("collapsedHighlights", { ...form.collapsedHighlights, [i]: !form.collapsedHighlights[i] });

  const handleDragHighlight = (result: DropResult) => {
    if (!result.destination) return;
    const sIdx = result.source.index;
    const dIdx = result.destination.index;
    if (sIdx === dIdx) return;
    const next = Array.from(form.guidelinesHighlights);
    const [moved] = next.splice(sIdx, 1);
    next.splice(dIdx, 0, moved);
    const newCollapsed: Record<number, boolean> = {};
    next.forEach((_, idx) => {
      let old = idx;
      if (idx === dIdx) old = sIdx;
      else if (sIdx < dIdx && idx >= sIdx && idx < dIdx) old = idx + 1;
      else if (sIdx > dIdx && idx > dIdx && idx <= sIdx) old = idx - 1;
      newCollapsed[idx] = form.collapsedHighlights[old] || false;
    });
    update("collapsedHighlights", newCollapsed);
    update("guidelinesHighlights", next);
  };

  const addLink = () => update("links", [...form.links, { label: "", url: "", icon: "default", description: "" }]);
  const removeLink = (i: number) => update("links", form.links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: string, value: string) =>
    update("links", form.links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  // ─── Render de cada seção pela sectionOrder ─────────────────────────────────
  const renderSection = (section: string) => {
    switch (section) {
      case "summary":
        return (
          <div key="summary" className="p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}>
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🧠 Estratégia Inicial</h2>
              <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
                {!isSummaryCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {!isSummaryCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4 mt-1">
                  <RichTextEditor value={form.strategy} onChange={(val) => update("strategy", val)} placeholder="Descreva a estratégia inicial com formatação..." />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "steps":
        return (
          <div key="steps" className="p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between cursor-pointer -m-5 p-5 mb-0" onClick={() => setIsStepsCollapsed(!isStepsCollapsed)}>
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">📋 Próximos Passos</h2>
              <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
                {!isStepsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {!isStepsCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 pt-4 mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
                    <div className="flex items-center gap-4 ml-auto">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.hideStepsTitle} onChange={(e) => update("hideStepsTitle", e.target.checked)} className="w-4 h-4 accent-gold" />
                        <span className="text-xs text-muted-foreground">Ocultar Títulos dos Subitens</span>
                      </label>
                      <button onClick={addStep} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                        <Plus className="w-3 h-3" /> Adicionar Passo
                      </button>
                    </div>
                  </div>
                  <div>
                    <input value={form.stepsTitle} onChange={(e) => update("stepsTitle", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground font-semibold" placeholder="Título da Seção (ex: 📋 PRÓXIMOS PASSOS)" />
                  </div>
                  <DragDropContext onDragEnd={handleDragStep}>
                    <Droppable droppableId="steps-list">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 mt-4">
                          {form.steps.map((step, i) => {
                            const isCollapsed = form.collapsedSteps[i];
                            return (
                              <Draggable key={`step-${i}`} draggableId={`step-${i}`} index={i}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`p-3 rounded-lg border transition-colors ${snapshot.isDragging ? "bg-secondary border-gold shadow-gold ring-1 ring-gold/50 z-10" : "bg-card border-border"}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold p-1 -ml-1 shrink-0">
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                      <button type="button" onClick={() => toggleStepCollapse(i)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0 border border-border bg-background">
                                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                      <input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground font-medium" placeholder="Título do passo" />
                                      <div className="flex gap-1 shrink-0 ml-auto">
                                        <button onClick={() => duplicateStep(i)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md" title="Duplicar">
                                          <Copy className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => removeStep(i)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-md" title="Excluir">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <AnimatePresence>
                                      {!isCollapsed && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3 border-t border-border mt-3">
                                          <RichTextEditor value={step.description} onChange={(val) => updateStep(i, "description", val)} placeholder="Descrição com formatação..." />
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
                  {form.steps.length === 0 && <p className="text-xs text-muted-foreground mt-4">Nenhum passo adicionado.</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "standardButtons":
        return (
          <div key="standardButtons" className="p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsStandardBlocksCollapsed(!isStandardBlocksCollapsed)}>
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🎯 Botões Padrões</h2>
              <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
                {!isStandardBlocksCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {!isStandardBlocksCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Cada botão aparece na página do aluno como card circular. Arraste para reordenar. Clique em uma linha pra configurar (foto, login/senha, links, texto).</p>
                  <StandardBlocksEditor
                    value={form.standardBlocks}
                    onChange={(next) => update("standardBlocks", next)}
                    order={form.standardBlocksOrder}
                    onOrderChange={(next) => update("standardBlocksOrder", next)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "optionalBlocks":
        return (
          <div key="optionalBlocks" className="p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsOptionalBlocksCollapsed(!isOptionalBlocksCollapsed)}>
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🧩 Blocos Customizados</h2>
              <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
                {!isOptionalBlocksCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {!isOptionalBlocksCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-3">Blocos 100% personalizados que aparecem como cards expandidos na página do aluno.</p>
                  <SortableCustomBlocks
                    blocks={form.optionalBlocks as any}
                    collapsedState={form.collapsedOptionalBlocks}
                    onChange={(blocks) => update("optionalBlocks", blocks)}
                    onCollapseChange={(newState) => update("collapsedOptionalBlocks", newState)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "links":
        return (
          <div key="links" className="p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsLinksCollapsed(!isLinksCollapsed)}>
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🔗 Links</h2>
              <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
                {!isLinksCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {!isLinksCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 pt-4 mt-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">Área de Membros</label>
                      <input value={form.membersLink} onChange={(e) => update("membersLink", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">WhatsApp Suporte</label>
                      <input value={form.whatsappUrl} onChange={(e) => update("whatsappUrl", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="https://wa.me/..." />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <h3 className="text-xs text-muted-foreground font-medium">Links Adicionais</h3>
                    <button onClick={addLink} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                  {form.links.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Nome do link" />
                        <input value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="URL" />
                      </div>
                      <button onClick={() => removeLink(i)} className="p-2 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "guidelines":
        return (
          <div key="guidelines" className="p-5 rounded-lg bg-card border border-border">
            <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsGuidelinesCollapsed(!isGuidelinesCollapsed)}>
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">📌 Orientações Importantes</h2>
              <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
                {!isGuidelinesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {!isGuidelinesCollapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-4 mt-6 border-t border-border">
                  <div className="space-y-2">
                    <input value={form.guidelinesTitle} onChange={(e) => update("guidelinesTitle", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground font-semibold" placeholder="Título da Seção (ex: 📌 Orientações Importantes)" />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.hideGuidelinesTitle} onChange={(e) => update("hideGuidelinesTitle", e.target.checked)} className="w-4 h-4 accent-gold" />
                      <span className="text-xs text-muted-foreground">Ocultar título da seção (mostra só os destaques)</span>
                    </label>
                  </div>
                  <RichTextEditor value={form.guidelinesContent} onChange={(val) => update("guidelinesContent", val)} placeholder="Orientações detalhadas..." />
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xs text-muted-foreground font-medium">Destaques</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.hideHighlightsTitle} onChange={(e) => update("hideHighlightsTitle", e.target.checked)} className="w-4 h-4 accent-gold" />
                        <span className="text-xs text-muted-foreground">Ocultar palavra DESTAQUE</span>
                      </label>
                    </div>
                    <button onClick={addHighlight} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                      <Plus className="w-3 h-3" /> Adicionar
                    </button>
                  </div>
                  <DragDropContext onDragEnd={handleDragHighlight}>
                    <Droppable droppableId="highlights-list">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 mt-4">
                          {form.guidelinesHighlights.map((h, i) => {
                            const isCollapsed = form.collapsedHighlights[i];
                            return (
                              <Draggable key={`highlight-${i}`} draggableId={`highlight-${i}`} index={i}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`flex gap-2 p-3 rounded-lg border transition-colors ${snapshot.isDragging ? "bg-secondary border-gold shadow-gold ring-1 ring-gold/50 z-10" : h.hidden ? "bg-card border-border opacity-50" : "bg-card border-border"}`}
                                  >
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold p-1 -ml-1">
                                          <GripVertical className="w-4 h-4" />
                                        </div>
                                        <button type="button" onClick={() => toggleHighlightCollapse(i)} className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0 border border-border bg-background">
                                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                        <input
                                          value={h.title}
                                          onChange={(e) => {
                                            const arr = [...form.guidelinesHighlights];
                                            arr[i] = { ...arr[i], title: e.target.value };
                                            update("guidelinesHighlights", arr);
                                          }}
                                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground font-medium"
                                          placeholder="Nome interno do destaque"
                                        />
                                      </div>
                                      <AnimatePresence>
                                        {!isCollapsed && (
                                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-2">
                                            <RichTextEditor
                                              value={h.content}
                                              onChange={(val) => {
                                                const arr = [...form.guidelinesHighlights];
                                                arr[i] = { ...arr[i], content: val };
                                                update("guidelinesHighlights", arr);
                                              }}
                                              placeholder="Destaque com suporte a negrito e cores..."
                                            />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                    <div className="flex flex-col gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const arr = [...form.guidelinesHighlights];
                                          arr[i] = { ...arr[i], hidden: !arr[i].hidden };
                                          update("guidelinesHighlights", arr);
                                        }}
                                        className={`p-2 transition-colors ${h.hidden ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}
                                        title={h.hidden ? "Mostrar destaque" : "Ocultar destaque"}
                                      >
                                        {h.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </button>
                                      <button onClick={() => removeHighlight(i)} className="p-2 text-muted-foreground hover:text-destructive shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "support":
        return null;
      case "credentials":
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      {form.sectionOrder.map(renderSection)}

      {/* Imagem Extras (rodapé) */}
      <div className="p-5 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsExtrasCollapsed(!isExtrasCollapsed)}>
          <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🖼️ Imagem Final (Extras)</h2>
          <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
            {!isExtrasCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <AnimatePresence>
          {!isExtrasCollapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-4 pt-4 mt-1">
              <p className="text-xs text-muted-foreground">Imagem fixa que aparece no rodapé da página do aluno, sem título nem card. Deixe vazio para não exibir.</p>
              {form.extrasImageUrl && (
                <div className="relative w-full max-w-md rounded-lg overflow-hidden border border-border">
                  <img src={form.extrasImageUrl} alt="Imagem extras" className="w-full h-48 object-cover" />
                  <button type="button" onClick={() => update("extrasImageUrl", "")} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white" title="Remover">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <ImageUpload
                label={form.extrasImageUrl ? "Trocar Imagem" : "Adicionar Imagem"}
                onUpload={(url) => update("extrasImageUrl", url)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ordenação das Seções */}
      <div className="p-5 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between cursor-pointer -m-5 p-5" onClick={() => setIsSectionOrderCollapsed(!isSectionOrderCollapsed)}>
          <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">🔄 Ordenação das Seções</h2>
          <button type="button" className="p-1 hover:bg-secondary rounded-md text-muted-foreground">
            {!isSectionOrderCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <AnimatePresence>
          {!isSectionOrderCollapsed && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-4 mt-1">
              <p className="text-xs text-muted-foreground">Arraste para reordenar como as seções aparecerão na página do aluno.</p>
              <SortableSections items={form.sectionOrder} onChange={(newOrder) => update("sectionOrder", newOrder)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PageEditorSections;
