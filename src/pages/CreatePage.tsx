import { useState, useEffect } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, AlertCircle, Plus, Trash2, ArrowLeft, Eye, EyeOff, X, LayoutTemplate, GripVertical, Copy, ChevronDown, ChevronRight, Link } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRequireAuth } from "@/hooks/useAuth";
import { useCreateStudentPage, useUpdateStudentPage, useStudentPageById, useStudentPages, generateSlug } from "@/hooks/useStudentPages";
import { useTemplates, useCreateTemplate } from "@/hooks/useTemplates";
import type { TemplateContent, TemplateBlocks } from "@/hooks/useTemplates";
import type { Json } from "@/integrations/supabase/types";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/components/SortableSections";
import LivePreviewModal from "@/components/LivePreviewModal";
import { TagInput } from "@/components/TagInput";
import PageEditorSections from "@/components/PageEditorSections";

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

export interface StandardBlock {
  enabled: boolean;
  imageUrl?: string;
  description?: string;
  login?: string;
  password?: string;
  androidUrl?: string;
  iosUrl?: string;
}

export interface AreaMembrosBlock {
  enabled: boolean;
  url?: string;
  description?: string;
}

export interface StandardBlocksData {
  bioimpedancia: StandardBlock;
  planoAlimentar: StandardBlock;
  treino: StandardBlock;
  checkins: StandardBlock;
  psicologa: StandardBlock;
  areaMembros: AreaMembrosBlock;
}

export type StandardBlockKey = "bioimpedancia" | "planoAlimentar" | "treino" | "checkins" | "psicologa" | "areaMembros";

export const DEFAULT_STANDARD_BLOCKS_ORDER: StandardBlockKey[] = [
  "bioimpedancia",
  "planoAlimentar",
  "treino",
  "checkins",
  "psicologa",
  "areaMembros",
];

const emptyStandardBlocks: StandardBlocksData = {
  bioimpedancia: { enabled: false },
  planoAlimentar: { enabled: false },
  treino: { enabled: false },
  checkins: { enabled: false },
  psicologa: { enabled: false },
  areaMembros: { enabled: false },
};

/** Mescla standardBlocks vindo do banco com defaults, e migra campos legados (webdiet/mfit/members_link/has_*) se ainda não existirem no novo formato. */
export function mergeStandardBlocks(
  raw: any,
  legacy: {
    has_bioimpedancia?: boolean;
    has_psicologa?: boolean;
    has_apps?: boolean;
    has_treino?: boolean;
    has_area_membros?: boolean;
    webdiet_login?: string | null;
    webdiet_password?: string | null;
    mfit_login?: string | null;
    mfit_password?: string | null;
    members_link?: string | null;
  } = {}
): StandardBlocksData {
  const r = (raw || {}) as Partial<StandardBlocksData>;
  return {
    bioimpedancia: {
      enabled: r.bioimpedancia?.enabled ?? legacy.has_bioimpedancia ?? false,
      imageUrl: r.bioimpedancia?.imageUrl ?? "",
      description: r.bioimpedancia?.description ?? "",
    },
    planoAlimentar: {
      enabled: r.planoAlimentar?.enabled ?? legacy.has_apps ?? false,
      imageUrl: r.planoAlimentar?.imageUrl ?? "",
      description: r.planoAlimentar?.description ?? "",
      login: r.planoAlimentar?.login ?? legacy.webdiet_login ?? "",
      password: r.planoAlimentar?.password ?? legacy.webdiet_password ?? "",
      androidUrl: r.planoAlimentar?.androidUrl ?? "",
      iosUrl: r.planoAlimentar?.iosUrl ?? "",
    },
    treino: {
      enabled: r.treino?.enabled ?? legacy.has_treino ?? false,
      imageUrl: r.treino?.imageUrl ?? "",
      description: r.treino?.description ?? "",
      login: r.treino?.login ?? legacy.mfit_login ?? "",
      password: r.treino?.password ?? legacy.mfit_password ?? "",
      androidUrl: r.treino?.androidUrl ?? "",
      iosUrl: r.treino?.iosUrl ?? "",
    },
    checkins: {
      enabled: r.checkins?.enabled ?? false,
      imageUrl: r.checkins?.imageUrl ?? "",
      description: r.checkins?.description ?? "",
    },
    psicologa: {
      enabled: r.psicologa?.enabled ?? legacy.has_psicologa ?? false,
      imageUrl: r.psicologa?.imageUrl ?? "",
      description: r.psicologa?.description ?? "",
    },
    areaMembros: {
      enabled: r.areaMembros?.enabled ?? legacy.has_area_membros ?? false,
      url: r.areaMembros?.url ?? legacy.members_link ?? "",
      description: r.areaMembros?.description ?? "",
    },
  };
}

/** Sanitiza/completa um array de ordem de blocos padrões. */
export function normalizeStandardBlocksOrder(raw: any): StandardBlockKey[] {
  const valid = new Set<StandardBlockKey>(DEFAULT_STANDARD_BLOCKS_ORDER);
  const filtered = Array.isArray(raw)
    ? (raw.filter((k: any) => valid.has(k)) as StandardBlockKey[])
    : [];
  // Acrescenta os que estiverem faltando, preservando a ordem default
  for (const k of DEFAULT_STANDARD_BLOCKS_ORDER) {
    if (!filtered.includes(k)) filtered.push(k);
  }
  return filtered;
}

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
  standardBlocks: StandardBlocksData;
  standardBlocksOrder: StandardBlockKey[];
  standardBlocksOpen: StandardBlockKey[] | null;
  extrasImageUrl: string;
  editorCollapse: Record<string, boolean>;
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
  hideGuidelinesTitle: boolean;
  hideHighlightsTitle: boolean;
  guidelinesContent: string;
  guidelinesHighlights: Array<{ title: string; content: string; hidden?: boolean }>;
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
  plan: "Anual",
  hasTreino: true,
  hasPsicologa: false,
  hasBioimpedancia: false,
  hasAreaMembros: true,
  hasApps: true,
  standardBlocks: emptyStandardBlocks,
  standardBlocksOrder: DEFAULT_STANDARD_BLOCKS_ORDER,
  standardBlocksOpen: null,
  extrasImageUrl: "",
  editorCollapse: {},
  membersLink: "",
  supportLink: "",
  webdietLogin: "",
  webdietPassword: "",
  mfitLogin: "",
  mfitPassword: "",
  notes: "",
  strategy: "",
  duration: "12 meses",
  whatsappUrl: "",
  supportHours: "",
  steps: [],
  stepsTitle: "📋 PRÓXIMOS PASSOS",
  hideStepsTitle: false,
  guidelinesTitle: "📌 Orientações Importantes",
  hideGuidelinesTitle: false,
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

  // Estados de UI persistidos em form.editorCollapse (default: aberto, exceto basicInfo)
  const isNotesCollapsed = form.editorCollapse?.notes ?? false;
  const setIsNotesCollapsed = (v: boolean) =>
    update("editorCollapse", { ...form.editorCollapse, notes: v });
  const isBasicInfoCollapsed = form.editorCollapse?.basicInfo ?? true;
  const setIsBasicInfoCollapsed = (v: boolean) =>
    update("editorCollapse", { ...form.editorCollapse, basicInfo: v });
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
        hideGuidelinesTitle: cc.guidelines?.hideGuidelinesTitle ?? false,
        hideHighlightsTitle: cc.guidelines?.hideHighlightsTitle ?? false,
        guidelinesContent: cc.guidelines?.content || "",
        guidelinesHighlights: (cc.guidelines?.highlights || []).map((h: any) =>
          typeof h === "string" ? { title: "Destaque", content: h } : h
        ),
        faqs: cc.faqs || [],
        optionalBlocks: cc.optionalBlocks || [],
        links: cc.links || [],
        tags: cc.tags || [],
        sectionOrder: normalizeSectionOrder(cc.sectionOrder || DEFAULT_SECTION_ORDER),
        collapsedSteps: cc.collapsedSteps || {},
        collapsedHighlights: cc.collapsedHighlights || {},
        collapsedOptionalBlocks: cc.collapsedOptionalBlocks || {},
        standardBlocksOrder: normalizeStandardBlocksOrder(cc.standardBlocksOrder),
        standardBlocks: mergeStandardBlocks(cc.standardBlocks, {
          has_bioimpedancia: existingPage.has_bioimpedancia,
          has_psicologa: existingPage.has_psicologa,
          has_apps: existingPage.has_apps,
          has_treino: existingPage.has_treino,
          has_area_membros: existingPage.has_area_membros,
          webdiet_login: existingPage.webdiet_login,
          webdiet_password: existingPage.webdiet_password,
          mfit_login: existingPage.mfit_login,
          mfit_password: existingPage.mfit_password,
          members_link: existingPage.members_link,
        }),
        extrasImageUrl: cc.extrasImageUrl || "",
        editorCollapse: (cc.editorCollapse && typeof cc.editorCollapse === "object") ? cc.editorCollapse : {},
        standardBlocksOpen: Array.isArray(cc.standardBlocksOpen) ? cc.standardBlocksOpen : null,
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
      hideGuidelinesTitle: content.guidelines?.hideGuidelinesTitle ?? prev.hideGuidelinesTitle,
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
      sectionOrder: normalizeSectionOrder(content.sectionOrder || prev.sectionOrder),
      collapsedSteps: content.collapsedSteps || prev.collapsedSteps,
      collapsedHighlights: content.collapsedHighlights || prev.collapsedHighlights,
      collapsedOptionalBlocks: content.collapsedOptionalBlocks || prev.collapsedOptionalBlocks,
      standardBlocksOrder: normalizeStandardBlocksOrder(content.standardBlocksOrder),
      standardBlocks: mergeStandardBlocks(content.standardBlocks, {
        has_bioimpedancia: blocks.hasBioimpedancia,
        has_psicologa: blocks.hasPsicologa,
        has_apps: blocks.hasApps,
        has_treino: blocks.hasTreino,
        has_area_membros: blocks.hasAreaMembros,
        webdiet_login: content.credentials?.webdietLogin,
        webdiet_password: content.credentials?.webdietPassword,
        mfit_login: content.credentials?.mfitLogin,
        mfit_password: content.credentials?.mfitPassword,
        members_link: content.membersLink,
      }),
      extrasImageUrl: content.extrasImageUrl ?? prev.extrasImageUrl,
      editorCollapse: (content.editorCollapse && typeof content.editorCollapse === "object") ? content.editorCollapse : prev.editorCollapse,
      standardBlocksOpen: Array.isArray(content.standardBlocksOpen) ? content.standardBlocksOpen : prev.standardBlocksOpen,
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
        hideGuidelinesTitle: form.hideGuidelinesTitle,
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
      standardBlocks: form.standardBlocks,
      standardBlocksOrder: form.standardBlocksOrder,
      extrasImageUrl: form.extrasImageUrl,
      editorCollapse: form.editorCollapse,
      standardBlocksOpen: form.standardBlocksOpen,
    } as Json;
  };

  const handleSave = async (status: "rascunho" | "revisado" | "enviado") => {
    if (!form.name.trim()) {
      toast.error("Nome do aluno é obrigatório!");
      return;
    }

    const slug = generateSlug(form.name);

    const sb = form.standardBlocks;
    const pageData = {
      student_name: form.name,
      slug,
      objective: form.objective as any,
      plan: form.plan as any,
      status,
      has_treino: sb.treino.enabled,
      has_psicologa: sb.psicologa.enabled,
      has_bioimpedancia: sb.bioimpedancia.enabled,
      has_area_membros: sb.areaMembros.enabled,
      has_apps: sb.planoAlimentar.enabled,
      members_link: sb.areaMembros.url || form.membersLink || null,
      support_link: form.supportLink || null,
      webdiet_login: sb.planoAlimentar.login || null,
      webdiet_password: sb.planoAlimentar.password || null,
      mfit_login: sb.treino.login || null,
      mfit_password: sb.treino.password || null,
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
        hideGuidelinesTitle: form.hideGuidelinesTitle,
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
      standardBlocks: form.standardBlocks,
      standardBlocksOrder: form.standardBlocksOrder,
      extrasImageUrl: form.extrasImageUrl,
      editorCollapse: form.editorCollapse,
      standardBlocksOpen: form.standardBlocksOpen,
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
          <RouterLink to="/admin" className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </RouterLink>
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
          <div className="p-5 rounded-lg bg-card border border-border">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider mb-4">Dados do Aluno</h2>

            {/* Sempre visíveis: Nome + Plano */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Nome do Aluno</label>
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Nome completo" />
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

            {/* Toggle pra expandir o resto */}
            <button
              type="button"
              onClick={() => setIsBasicInfoCollapsed(!isBasicInfoCollapsed)}
              className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isBasicInfoCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {isBasicInfoCollapsed ? "Mostrar mais campos (Pasta, Objetivo, Tags, Duração, Suporte)" : "Ocultar campos adicionais"}
            </button>

            <AnimatePresence>
              {!isBasicInfoCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 overflow-hidden pt-4 mt-2 border-t border-border"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">Pasta (Organização Interna)</label>
                      <input list="folder-list" value={form.folder} onChange={(e) => update("folder", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Ex: Em Andamento, Presencial..." />
                      <datalist id="folder-list">
                        {uniqueFolders.map(f => (
                          <option key={f} value={f} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground font-medium">Objetivo</label>
                      <select value={form.objective} onChange={(e) => update("objective", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
                        {objectives.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <PageEditorSections form={form} update={update} />
        </motion.div>
      </main>
    </div>
  );
};

export default CreatePage;
