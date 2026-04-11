import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, AlertCircle, Plus, Trash2, ArrowLeft, Eye, X, LayoutTemplate, GripVertical, Copy, ChevronDown, ChevronRight, Link } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRequireAuth } from "@/hooks/useAuth";
import { useCreateStudentPage, useUpdateStudentPage, useStudentPageById, useStudentPages, generateSlug } from "@/hooks/useStudentPages";
import { useTemplates, useCreateTemplate } from "@/hooks/useTemplates";
import type { TemplateContent, TemplateBlocks } from "@/hooks/useTemplates";
import type { Json } from "@/integrations/supabase/types";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import SortableSections, { DEFAULT_SECTION_ORDER } from "@/components/SortableSections";
import SortableCustomBlocks from "@/components/SortableCustomBlocks";
import LivePreviewModal from "@/components/LivePreviewModal";
import { TagInput } from "@/components/TagInput";

const objectives = [
  { value: "emagrecimento", label: "Emagrecimento" },
  { value: "recomposicao", label: "Recomposição Corporal" },
  { value: "hipertrofia", label: "Hipertrofia" },
];

const plans = [
  { value: "shape", label: "Shape" },
  { value: "premium", label: "Premium" },
  { value: "premium_anual", label: "Premium Anual" },
];

interface FormState {
  name: string;
  folder: string;
  objective: string;
  plan: string;
  hasTreino: boolean;
  hasPsicologa: boolean;
  hasBioimpedancia: boolean;
  hasAreaMembros: boolean;
  hasApps: boolean;
  membersLink: string;
  supportLink: string;
  webdietLogin: string;
  webdietPassword: string;
  mfitLogin: string;
  mfitPassword: string;
  notes: string;
  strategy: string;
  duration: string;
  whatsappUrl: string;
  supportHours: string;
  steps: Array<{ title: string; description: string }>;
  stepsTitle: string;
  hideStepsTitle: boolean;
  guidelinesTitle: string;
  hideHighlightsTitle: boolean;
  guidelinesContent: string;
  guidelinesHighlights: Array<{ title: string; content: string }>;
  faqs: Array<{ question: string; answer: string }>;
  optionalBlocks: Array<{
    type: string;
    title: string;
    content: string;
    link?: string;
    linkLabel?: string;
    link2?: string;
    linkLabel2?: string;
    imageUrl?: string;
  }>;
  links: Array<{
    label: string;
    url: string;
    icon?: string;
    description?: string;
  }>;
  tags: string[];
  sectionOrder: string[];
  collapsedSteps: Record<number, boolean>;
  collapsedHighlights: Record<number, boolean>;
  collapsedOptionalBlocks: Record<number, boolean>;
}

const defaultForm: FormState = {
  name: "",
  folder: "",
  objective: "emagrecimento",
  plan: "shape",
  hasTreino: true,
  hasPsicologa: false,
  hasBioimpedancia: false,
  hasAreaMembros: true,
  hasApps: true,
  membersLink: "",
  supportLink: "",
  webdietLogin: "",
  webdietPassword: "",
  mfitLogin: "",
  mfitPassword: "",
  notes: "",
  strategy: "",
  duration: "",
  whatsappUrl: "",
  supportHours: "",
  steps: [],
  stepsTitle: "📋 PRÓXIMOS PASSOS",
  hideStepsTitle: false,
  guidelinesTitle: "📌 Orientações Importantes",
  hideHighlightsTitle: false,
  guidelinesContent: "",
  guidelinesHighlights: [],
  faqs: [],
  optionalBlocks: [],
  links: [],
  tags: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  collapsedSteps: {},
  collapsedHighlights: {},
  collapsedOptionalBlocks: {},
};

const CreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { user } = useRequireAuth();

  const [form, setForm] = useState<FormState>({ ...defaultForm });
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const [isSectionOrderCollapsed, setIsSectionOrderCollapsed] = useState(true);
  const [isOptionalBlocksCollapsed, setIsOptionalBlocksCollapsed] = useState(false);
  const [isStandardBlocksCollapsed, setIsStandardBlocksCollapsed] = useState(true);
  const [isNotesCollapsed, setIsNotesCollapsed] = useState(true);
  const [isGuidelinesCollapsed, setIsGuidelinesCollapsed] = useState(false);
  const toggleStepCollapse = (i: number) => {
    const novoEstado = { ...form.collapsedSteps, [i]: !form.collapsedSteps[i] };
    update("collapsedSteps", novoEstado);
  };

  const toggleHighlightCollapse = (i: number) => {
    const novoEstado = { ...form.collapsedHighlights, [i]: !form.collapsedHighlights[i] };
    update("collapsedHighlights", novoEstado);
  };

  const { data: templates = [] } = useTemplates();
  const { data: pages = [] } = useStudentPages();
  const uniqueFolders = Array.from(new Set(pages.map((p) => (p.custom_content as any)?.folder).filter(Boolean))) as string[];

  // Deriva todas as tags usadas por todos os alunos
  const allAvailableTags = Array.from(new Set(pages.flatMap(p => (p.custom_content as any)?.tags || []))).sort() as string[];

  const { data: existingPage } = useStudentPageById(id || "");
  const createMutation = useCreateStudentPage();
  const updateMutation = useUpdateStudentPage();
  const createTemplateMutation = useCreateTemplate();

  // Load existing page data for editing
  useEffect(() => {
    if (isEditing && existingPage) {
      const cc = (existingPage.custom_content || {}) as Record<string, any>;
      setForm({
        name: existingPage.student_name || "",
        folder: (cc.folder as string) || "",
        objective: existingPage.objective as any,
        plan: existingPage.plan as any,
        hasTreino: existingPage.has_treino,
        hasPsicologa: existingPage.has_psicologa,
        hasBioimpedancia: existingPage.has_bioimpedancia,
        hasAreaMembros: existingPage.has_area_membros,
        hasApps: existingPage.has_apps,
        membersLink: existingPage.members_link || "",
        supportLink: existingPage.support_link || "",
        webdietLogin: existingPage.webdiet_login || "",
        webdietPassword: existingPage.webdiet_password || "",
        mfitLogin: existingPage.mfit_login || "",
        mfitPassword: existingPage.mfit_password || "",
        notes: existingPage.notes || "",
        strategy: existingPage.strategy || "",
        duration: existingPage.duration || "",
        whatsappUrl: cc.whatsappUrl || "",
        supportHours: cc.supportHours || "",
        steps: cc.steps || [],
        stepsTitle: cc.stepsTitle || "📋 PRÓXIMOS PASSOS",
        hideStepsTitle: cc.hideStepsTitle ?? false,
        guidelinesTitle: cc.guidelines?.title || "📌 Orientações Importantes",
        hideHighlightsTitle: cc.guidelines?.hideHighlightsTitle ?? false,
        guidelinesContent: cc.guidelines?.content || "",
        guidelinesHighlights: (cc.guidelines?.highlights || []).map((h: any) =>
          typeof h === "string" ? { title: "Destaque", content: h } : h
        ),
        faqs: cc.faqs || [],
        optionalBlocks: cc.optionalBlocks || [],
        links: cc.links || [],
        tags: cc.tags || [],
        sectionOrder: cc.sectionOrder || DEFAULT_SECTION_ORDER,
        collapsedSteps: cc.collapsedSteps || {},
        collapsedHighlights: cc.collapsedHighlights || {},
        collapsedOptionalBlocks: cc.collapsedOptionalBlocks || {},
      });
    }
  }, [isEditing, existingPage]);

  const update = (field: keyof FormState, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Apply template data to form
  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const content = (template.content || {}) as Record<string, any>;
    const blocks = (template.blocks || {}) as Record<string, any>;

    setForm((prev) => ({
      ...prev,
      objective: template.objective,
      strategy: content.strategy || prev.strategy,
      duration: content.duration || prev.duration,
      whatsappUrl: content.whatsappUrl || prev.whatsappUrl,
      supportHours: content.supportHours || prev.supportHours,
      steps: content.steps || prev.steps,
      stepsTitle: content.stepsTitle || prev.stepsTitle,
      hideStepsTitle: content.hideStepsTitle ?? prev.hideStepsTitle,
      guidelinesTitle: content.guidelines?.title || prev.guidelinesTitle,
      hideHighlightsTitle: content.guidelines?.hideHighlightsTitle ?? prev.hideHighlightsTitle,
      guidelinesContent: content.guidelines?.content || prev.guidelinesContent,
      guidelinesHighlights: content.guidelines?.highlights
        ? content.guidelines.highlights.map((h: any) => typeof h === "string" ? { title: "Destaque", content: h } : h)
        : prev.guidelinesHighlights,
      faqs: content.faqs || prev.faqs,
      links: content.links || prev.links,
      tags: content.tags || prev.tags,
      webdietLogin: content.credentials?.webdietLogin || prev.webdietLogin,
      webdietPassword: content.credentials?.webdietPassword || prev.webdietPassword,
      mfitLogin: content.credentials?.mfitLogin || prev.mfitLogin,
      mfitPassword: content.credentials?.mfitPassword || prev.mfitPassword,
      membersLink: content.membersLink || content.links?.find((l: any) => l.icon === "members")?.url || prev.membersLink,
      supportLink: content.links?.find((l: any) => l.icon === "support")?.url || prev.supportLink,
      notes: content.notes || prev.notes,
      hasTreino: blocks.hasTreino ?? prev.hasTreino,
      hasPsicologa: blocks.hasPsicologa ?? prev.hasPsicologa,
      hasBioimpedancia: blocks.hasBioimpedancia ?? prev.hasBioimpedancia,
      hasAreaMembros: blocks.hasAreaMembros ?? prev.hasAreaMembros,
      hasApps: blocks.hasApps ?? prev.hasApps,
      optionalBlocks: blocks.optionalBlocks || prev.optionalBlocks,
      sectionOrder: content.sectionOrder || prev.sectionOrder,
      collapsedSteps: content.collapsedSteps || prev.collapsedSteps,
      collapsedHighlights: content.collapsedHighlights || prev.collapsedHighlights,
      collapsedOptionalBlocks: content.collapsedOptionalBlocks || prev.collapsedOptionalBlocks,
    }));

    toast.success("Template aplicado!");
  };

  const buildCustomContent = (): Json => {
    return {
      folder: form.folder,
      whatsappUrl: form.whatsappUrl,
      supportHours: form.supportHours,
      steps: form.steps,
      stepsTitle: form.stepsTitle,
      hideStepsTitle: form.hideStepsTitle,
      guidelines: {
        title: form.guidelinesTitle,
        hideHighlightsTitle: form.hideHighlightsTitle,
        content: form.guidelinesContent,
        highlights: form.guidelinesHighlights,
      },
      faqs: form.faqs,
      optionalBlocks: form.optionalBlocks,
      links: form.links,
      tags: form.tags,
      sectionOrder: form.sectionOrder,
      collapsedSteps: form.collapsedSteps,
      collapsedHighlights: form.collapsedHighlights,
      collapsedOptionalBlocks: form.collapsedOptionalBlocks,
    } as Json;
  };

  const handleSave = async (status: "rascunho" | "revisado" | "enviado") => {
    if (!form.name.trim()) {
      toast.error("Nome do aluno é obrigatório!");
      return;
    }

    const slug = generateSlug(form.name);

    const pageData = {
      student_name: form.name,
      slug,
      objective: form.objective as any,
      plan: form.plan as any,
      status,
      has_treino: form.hasTreino,
      has_psicologa: form.hasPsicologa,
      has_bioimpedancia: form.hasBioimpedancia,
      has_area_membros: form.hasAreaMembros,
      has_apps: form.hasApps,
      members_link: form.membersLink || null,
      support_link: form.supportLink || null,
      webdiet_login: form.webdietLogin || null,
      webdiet_password: form.webdietPassword || null,
      mfit_login: form.mfitLogin || null,
      mfit_password: form.mfitPassword || null,
      notes: form.notes || null,
      strategy: form.strategy || null,
      duration: form.duration || null,
      custom_content: buildCustomContent(),
      template_id: selectedTemplateId || null,
    };

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({ id, ...pageData });
        toast.success("Página atualizada!");
      } else {
        await createMutation.mutateAsync({
          ...pageData,
          created_by: user?.id ?? null,
        });
        toast.success(
          status === "rascunho" ? "Rascunho salvo!" : "Página publicada!"
        );
      }
      navigate("/admin");
    } catch (err: any) {
      if (err.message?.includes("duplicate key")) {
        toast.error("Já existe uma página com esse nome (slug). Tente outro nome.");
      } else {
        toast.error(err.message || "Erro ao salvar.");
      }
    }
  };

  const handleSaveAsTemplate = async () => {
    const name = prompt("Nome do template:");
    if (!name) return;

    const content: TemplateContent = {
      strategy: form.strategy,
      duration: form.duration,
      steps: form.steps,
      stepsTitle: form.stepsTitle,
      hideStepsTitle: form.hideStepsTitle,
      guidelines: {
        title: form.guidelinesTitle,
        hideHighlightsTitle: form.hideHighlightsTitle,
        content: form.guidelinesContent,
        highlights: form.guidelinesHighlights,
      },
      faqs: form.faqs,
      links: form.links,
      credentials: {
        webdietLogin: form.webdietLogin,
        webdietPassword: form.webdietPassword,
        mfitLogin: form.mfitLogin,
        mfitPassword: form.mfitPassword,
      },
      membersLink: form.membersLink,
      supportHours: form.supportHours,
      whatsappUrl: form.whatsappUrl,
      notes: form.notes,
      sectionOrder: form.sectionOrder,
      collapsedSteps: form.collapsedSteps,
      collapsedHighlights: form.collapsedHighlights,
      collapsedOptionalBlocks: form.collapsedOptionalBlocks,
    };

    const blocks: TemplateBlocks = {
      hasTreino: form.hasTreino,
      hasPsicologa: form.hasPsicologa,
      hasBioimpedancia: form.hasBioimpedancia,
      hasAreaMembros: form.hasAreaMembros,
      hasApps: form.hasApps,
      optionalBlocks: form.optionalBlocks as any,
    };

    try {
      await createTemplateMutation.mutateAsync({
        name,
        objective: form.objective as any,
        content: content as unknown as Json,
        blocks: blocks as unknown as Json,
        created_by: user?.id ?? null,
      });
      toast.success("Template salvo com sucesso!");
    } catch {
      toast.error("Erro ao salvar template.");
    }
  };

  // Dynamic list helpers
  const addStep = () => update("steps", [...form.steps, { title: "", description: "" }]);
  const removeStep = (i: number) => update("steps", form.steps.filter((_, idx) => idx !== i));
  const duplicateStep = (i: number) => {
    const stepToClone = form.steps[i];
    const newSteps = [...form.steps];
    newSteps.splice(i + 1, 0, { ...stepToClone });
    update("steps", newSteps);
  };
  const updateStep = (i: number, field: string, value: string) =>
    update("steps", form.steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const handleDragStep = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newSteps = Array.from(form.steps);
    const [reordered] = newSteps.splice(sourceIndex, 1);
    newSteps.splice(destinationIndex, 0, reordered);

    // Adjust collapsed states
    const newCollapsed: Record<number, boolean> = {};
    newSteps.forEach((_, index) => {
      let oldIndex = index;
      if (index === destinationIndex) oldIndex = sourceIndex;
      else if (sourceIndex < destinationIndex && index >= sourceIndex && index < destinationIndex) oldIndex = index + 1;
      else if (sourceIndex > destinationIndex && index > destinationIndex && index <= sourceIndex) oldIndex = index - 1;
      newCollapsed[index] = form.collapsedSteps[oldIndex] || false;
    });

    update("collapsedSteps", newCollapsed);
    update("steps", newSteps);
  };

  const addHighlight = () => update("guidelinesHighlights", [...form.guidelinesHighlights, { title: `Destaque ${form.guidelinesHighlights.length + 1}`, content: "" }]);
  const removeHighlight = (i: number) => update("guidelinesHighlights", form.guidelinesHighlights.filter((_, idx) => idx !== i));

  const handleDragHighlight = (result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    const newHighlights = Array.from(form.guidelinesHighlights);
    const [reordered] = newHighlights.splice(sourceIndex, 1);
    newHighlights.splice(destinationIndex, 0, reordered);

    // Adjust collapsed states
    const newCollapsed: Record<number, boolean> = {};
    newHighlights.forEach((_, index) => {
      let oldIndex = index;
      if (index === destinationIndex) oldIndex = sourceIndex;
      else if (sourceIndex < destinationIndex && index >= sourceIndex && index < destinationIndex) oldIndex = index + 1;
      else if (sourceIndex > destinationIndex && index > destinationIndex && index <= sourceIndex) oldIndex = index - 1;
      newCollapsed[index] = form.collapsedHighlights[oldIndex] || false;
    });

    update("collapsedHighlights", newCollapsed);
    update("guidelinesHighlights", newHighlights);
  };

  const addFaq = () => update("faqs", [...form.faqs, { question: "", answer: "" }]);
  const removeFaq = (i: number) => update("faqs", form.faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: string, value: string) =>
    update("faqs", form.faqs.map((f, idx) => (idx === i ? { ...f, [field]: value } : f)));

  const addOptionalBlock = () =>
    update("optionalBlocks", [...form.optionalBlocks, { type: "extras", title: "", content: "" }]);
  const removeOptionalBlock = (i: number) =>
    update("optionalBlocks", form.optionalBlocks.filter((_, idx) => idx !== i));
  const duplicateOptionalBlock = (i: number) => {
    const blockToClone = form.optionalBlocks[i];
    const newBlocks = [...form.optionalBlocks];
    newBlocks.splice(i + 1, 0, { ...blockToClone, title: blockToClone.title + " (Cópia)" });
    update("optionalBlocks", newBlocks);
  };
  const updateOptionalBlock = (i: number, field: string, value: string) =>
    update("optionalBlocks", form.optionalBlocks.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));

  const addLink = () => update("links", [...form.links, { label: "", url: "", icon: "default", description: "" }]);
  const removeLink = (i: number) => update("links", form.links.filter((_, idx) => idx !== i));
  const updateLink = (i: number, field: string, value: string) =>
    update("links", form.links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="gradient-dark px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex gap-2">
            <LivePreviewModal formData={form} />
            <button
              onClick={handleSaveAsTemplate}
              className="px-3 py-2 rounded-lg border border-white/20 text-white text-xs font-medium hover:bg-white/5 transition-colors"
              title="Salvar como template"
            >
              <LayoutTemplate className="w-3 h-3 inline mr-1" />
              Salvar como Template
            </button>
            <button
              onClick={() => handleSave("rascunho")}
              className="px-4 py-2 rounded-lg border border-white/20 text-white text-xs font-medium hover:bg-white/5 transition-colors"
            >
              <Save className="w-3 h-3 inline mr-1" /> Rascunho
            </button>
            <button
              onClick={() => handleSave("enviado")}
              className="px-4 py-2 rounded-lg gradient-gold text-primary-foreground text-xs font-semibold hover:shadow-gold transition-all"
            >
              Publicar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h1 className="font-display text-2xl text-foreground">
            {isEditing ? "EDITAR PÁGINA" : "NOVA PÁGINA DE ALUNO"}
          </h1>

          {/* Template selector */}
          {!isEditing && templates.length > 0 && (
            <div className="p-5 rounded-lg bg-gold/5 border border-gold/20 space-y-3">
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-gold" />
                Usar Template como Base
              </h2>
              <select
                value={selectedTemplateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="">Selecione um template (opcional)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {objectives.find((o) => o.value === t.objective)?.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Texto de Envio (Notes) */}
          <div className="p-5 rounded-lg bg-card border border-border">
            <div
              className="flex items-center justify-between cursor-pointer -m-5 p-5"
              onClick={() => setIsNotesCollapsed(!isNotesCollapsed)}
            >
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                📝 Texto de envio
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const slug = (isEditing && existingPage?.slug) ? existingPage.slug : generateSlug(form.name);
                    if (!slug) {
                      toast.error("Preencha o nome do aluno abaixo para gerar o link.");
                      return;
                    }
                    const url = `${window.location.origin}/aluno/${slug}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link do aluno copiado!");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-background border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Link className="w-3.5 h-3.5" /> Copiar Link
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground focus:outline-none"
                >
                  {!isNotesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isNotesCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden pt-4 mt-1"
                >
                  <p className="text-xs text-muted-foreground">Este texto é apenas para organização interna e não aparecerá para o aluno.</p>
                  <textarea
                    value={form.notes}
                    onChange={(e) => {
                      update("notes", e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground resize-y overflow-hidden"
                    placeholder="Texto de envio para este aluno..."
                    style={{ minHeight: '150px' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Basic info */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-4">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Dados do Aluno</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Nome do Aluno</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Nome completo" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Pasta (Organização Interna)</label>
                <input list="folder-list" value={form.folder} onChange={(e) => update("folder", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Ex: Em Andamento, Presencial..." />
                <datalist id="folder-list">
                  {uniqueFolders.map(f => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Objetivo</label>
                <select value={form.objective} onChange={(e) => update("objective", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
                  {objectives.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Plano</label>
                <input list="plan-list" value={form.plan} onChange={(e) => update("plan", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Ex: Shape, Premium..." />
                <datalist id="plan-list">
                  {plans.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Tags section */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 block">Tags do Aluno</label>
              <TagInput
                value={form.tags}
                onChange={(tags) => update("tags", tags)}
                availableTags={allAvailableTags}
                placeholder="Selecione ou adicione tags (ex: Prioridade, Risco de Evasão)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Duração</label>
                <input value={form.duration} onChange={(e) => update("duration", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="12 meses de acompanhamento" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Horário Suporte</label>
                <input value={form.supportHours} onChange={(e) => update("supportHours", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Segunda à Sexta: 08h-18h" />
              </div>
            </div>
          </div>

          {form.sectionOrder.map((section) => {
            switch (section) {
              case "summary":
                return (
                  <div key="summary" className="p-5 rounded-lg bg-card border border-border space-y-4">
                    <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🧠 Estratégia Inicial</h2>
                    <RichTextEditor value={form.strategy} onChange={(val) => update("strategy", val)} placeholder="Descreva a estratégia inicial do aluno com formatação..." />
                  </div>
                );
              case "steps":
                return (
                  <div key="steps" className="p-5 rounded-lg bg-card border border-border space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">📋 Próximos Passos</h2>
                      <div className="flex items-center gap-4">
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
                                        <button
                                          type="button"
                                          onClick={() => toggleStepCollapse(i)}
                                          className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0 border border-border bg-background focus:outline-none"
                                        >
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
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pt-3 border-t border-border mt-3"
                                          >
                                            <RichTextEditor value={step.description} onChange={(val) => updateStep(i, "description", val)} placeholder="Descrição com formatação (suporta tópicos, negrito)..." />
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    {form.steps.length === 0 && <p className="text-xs text-muted-foreground mt-4">Nenhum passo adicionado.</p>}
                  </div>
                );
              case "optionalBlocks":
                return (
                  <div key="optionalBlocks" className="p-5 rounded-lg bg-card border border-border">
                    <div
                      className="flex items-center justify-between cursor-pointer -m-5 p-5"
                      onClick={() => setIsOptionalBlocksCollapsed(!isOptionalBlocksCollapsed)}
                    >
                      <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                        Blocos Opcionais
                      </h2>
                      <button
                        type="button"
                        className="p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground focus:outline-none"
                      >
                        {!isOptionalBlocksCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {!isOptionalBlocksCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-6 overflow-hidden mt-4 pt-4 border-t border-border"
                        >
                          <div className="space-y-3">
                            <div
                              className="flex items-center justify-between cursor-pointer group"
                              onClick={() => setIsStandardBlocksCollapsed(!isStandardBlocksCollapsed)}
                            >
                              <h3 className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors">Blocos Padrões (Apps e Credenciais)</h3>
                              <button
                                type="button"
                                className="p-1 hover:bg-background rounded-md transition-colors text-muted-foreground focus:outline-none"
                              >
                                {isStandardBlocksCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            </div>

                            <AnimatePresence>
                              {!isStandardBlocksCollapsed && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="space-y-3 overflow-hidden"
                                >
                                  {[
                                    { key: "hasTreino", label: "Treino" },
                                    { key: "hasPsicologa", label: "Psicóloga" },
                                    { key: "hasBioimpedancia", label: "Bioimpedância" },
                                    { key: "hasAreaMembros", label: "Área de Membros" },
                                    { key: "hasApps", label: "Apps (WebDiet / MFit)" },
                                  ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center justify-between p-3 rounded-md bg-background cursor-pointer border border-border">
                                      <span className="text-sm text-foreground">{label}</span>
                                      <input type="checkbox" checked={(form as any)[key]} onChange={(e) => update(key as any, e.target.checked)} className="w-5 h-5 rounded accent-gold" />
                                    </label>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="pt-2 border-t border-border mt-6">
                            <h3 className="text-xs text-muted-foreground font-medium mb-4">Blocos 100% Customizados</h3>
                            <SortableCustomBlocks
                              blocks={form.optionalBlocks as any}
                              collapsedState={form.collapsedOptionalBlocks}
                              onChange={(blocks) => update("optionalBlocks", blocks)}
                              onCollapseChange={(newState) => update("collapsedOptionalBlocks", newState)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              case "links":
                return (
                  <div key="links" className="p-5 rounded-lg bg-card border border-border space-y-4">
                    <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🔗 Links</h2>
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
                  </div>
                );
              case "credentials":
                return form.hasApps ? (
                  <div key="credentials" className="p-5 rounded-lg bg-card border border-border space-y-4">
                    <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🔐 Credenciais dos Apps</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">WebDiet Login</label>
                        <input value={form.webdietLogin} onChange={(e) => update("webdietLogin", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">WebDiet Senha</label>
                        <input value={form.webdietPassword} onChange={(e) => update("webdietPassword", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">MFit Login</label>
                        <input value={form.mfitLogin} onChange={(e) => update("mfitLogin", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground font-medium">MFit Senha</label>
                        <input value={form.mfitPassword} onChange={(e) => update("mfitPassword", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                      </div>
                    </div>
                  </div>
                ) : null;
              case "guidelines":
                return (
                  <div key="guidelines" className="p-5 rounded-lg bg-card border border-border">
                    <div
                      className="flex items-center justify-between cursor-pointer -m-5 p-5"
                      onClick={() => setIsGuidelinesCollapsed(!isGuidelinesCollapsed)}
                    >
                      <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                        📌 Orientações Importantes
                      </h2>
                      <button
                        type="button"
                        className="p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground focus:outline-none"
                      >
                        {!isGuidelinesCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {!isGuidelinesCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-4 overflow-hidden pt-4 mt-6 border-t border-border"
                        >
                          <div>
                            <input value={form.guidelinesTitle} onChange={(e) => update("guidelinesTitle", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground font-semibold" placeholder="Título da Seção (ex: 📌 Orientações Importantes)" />
                          </div>
                          <RichTextEditor value={form.guidelinesContent} onChange={(val) => update("guidelinesContent", val)} placeholder="Orientações detalhadas com suporte a formatação..." />
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
                                      className={`flex gap-2 p-3 rounded-lg border transition-colors ${snapshot.isDragging ? "bg-secondary border-gold shadow-gold ring-1 ring-gold/50 z-10" : "bg-card border-border"}`}
                                    >
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold p-1 -ml-1">
                                            <GripVertical className="w-4 h-4" />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => toggleHighlightCollapse(i)}
                                            className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground shrink-0 border border-border bg-background focus:outline-none"
                                          >
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
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden pt-2"
                                            >
                                              <RichTextEditor value={h.content} onChange={(val) => { const arr = [...form.guidelinesHighlights]; arr[i] = { ...arr[i], content: val }; update("guidelinesHighlights", arr); }} placeholder="Destaque numérico com suporte a negrito e cores..." />
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                      <button onClick={() => removeHighlight(i)} className="p-2 text-muted-foreground hover:text-destructive self-start pt-1 shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </Draggable>
                              )
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
                return (
                  <div key="support" className="p-5 rounded-lg bg-card border border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">❓ Dúvidas Frequentes</h2>
                      <button onClick={addFaq} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                        <Plus className="w-3 h-3" /> Adicionar
                      </button>
                    </div>
                    {form.faqs.map((faq, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="flex-1 space-y-2">
                          <input value={faq.question} onChange={(e) => updateFaq(i, "question", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Pergunta" />
                          <input value={faq.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Resposta" />
                        </div>
                        <button onClick={() => removeFaq(i)} className="p-2 text-muted-foreground hover:text-destructive self-start">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.faqs.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma FAQ adicionada.</p>}
                  </div>
                );
              default:
                return null;
            }
          })}

          {/* Ordenação */}
          <div className="p-5 rounded-lg bg-card border border-border">
            <div
              className="flex items-center justify-between cursor-pointer -m-5 p-5"
              onClick={() => setIsSectionOrderCollapsed(!isSectionOrderCollapsed)}
            >
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                🔄 Ordenação das Seções
              </h2>
              <button
                type="button"
                className="p-1 hover:bg-secondary rounded-md transition-colors text-muted-foreground focus:outline-none"
              >
                {!isSectionOrderCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {!isSectionOrderCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden pt-4 mt-1"
                >
                  <p className="text-xs text-muted-foreground">Arraste para reordenar como as seções aparecerão na página do aluno.</p>
                  <SortableSections items={form.sectionOrder} onChange={(newOrder) => update("sectionOrder", newOrder)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CreatePage;
