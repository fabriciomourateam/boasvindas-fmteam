import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, AlertCircle, Plus, Trash2, ArrowLeft, Eye, EyeOff, X, GripVertical, Copy, ChevronDown, ChevronRight, Link } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useRequireAuth } from "@/hooks/useAuth";
import {
    useTemplate,
    useCreateTemplate,
    useUpdateTemplate,
} from "@/hooks/useTemplates";
import type { TemplateContent, TemplateBlocks } from "@/hooks/useTemplates";
import type { Json } from "@/integrations/supabase/types";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/components/SortableSections";
import LivePreviewModal from "@/components/LivePreviewModal";
import PageEditorSections from "@/components/PageEditorSections";
import {
    mergeStandardBlocks,
    normalizeStandardBlocksOrder,
    DEFAULT_STANDARD_BLOCKS_ORDER,
} from "@/pages/CreatePage";
import type { StandardBlocksData, StandardBlockKey } from "@/pages/CreatePage";

const objectives = [
    { value: "emagrecimento", label: "Emagrecimento" },
    { value: "recomposicao", label: "Recomposição Corporal" },
    { value: "hipertrofia", label: "Hipertrofia" },
];

interface TemplateForm {
    name: string;
    objective: string;
    strategy: string;
    duration: string;
    whatsappUrl: string;
    supportHours: string;
    notes: string;
    hasTreino: boolean;
    hasPsicologa: boolean;
    hasBioimpedancia: boolean;
    hasAreaMembros: boolean;
    hasApps: boolean;
    webdietLogin: string;
    webdietPassword: string;
    mfitLogin: string;
    mfitPassword: string;
    membersLink: string;
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
        imageUrl?: string;
    }>;
    links: Array<{
        label: string;
        url: string;
        icon?: string;
        description?: string;
    }>;
    sectionOrder: string[];
    collapsedSteps: Record<number, boolean>;
    collapsedHighlights: Record<number, boolean>;
    collapsedOptionalBlocks: Record<number, boolean>;
    standardBlocks: StandardBlocksData;
    standardBlocksOrder: StandardBlockKey[];
    standardBlocksOpen: StandardBlockKey[] | null;
    extrasImageUrl: string;
    video: { url: string; buttonLabel: string; buttonUrl: string };
    editorCollapse: Record<string, boolean>;
}

const defaultForm: TemplateForm = {
    name: "",
    objective: "emagrecimento",
    strategy: "",
    duration: "",
    whatsappUrl: "",
    supportHours: "",
    notes: "",
    hasTreino: true,
    hasPsicologa: false,
    hasBioimpedancia: false,
    hasAreaMembros: true,
    hasApps: true,
    webdietLogin: "",
    webdietPassword: "",
    mfitLogin: "",
    mfitPassword: "",
    membersLink: "",
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
    sectionOrder: DEFAULT_SECTION_ORDER,
    collapsedSteps: {},
    collapsedHighlights: {},
    collapsedOptionalBlocks: {},
    standardBlocks: mergeStandardBlocks(null, {}),
    standardBlocksOrder: DEFAULT_STANDARD_BLOCKS_ORDER,
    standardBlocksOpen: null,
    extrasImageUrl: "",
    video: { url: "", buttonLabel: "", buttonUrl: "" },
    editorCollapse: {},
};

const EditTemplate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const duplicateId = searchParams.get("duplicar");
    const isEditing = !!id;
    const { user } = useRequireAuth();

    const [form, setForm] = useState<TemplateForm>({ ...defaultForm });

    const isNotesCollapsed = form.editorCollapse?.notes ?? true;
    const setIsNotesCollapsed = (v: boolean) =>
        update("editorCollapse", { ...form.editorCollapse, notes: v });
    const toggleStepCollapse = (i: number) => {
        const novoEstado = { ...form.collapsedSteps, [i]: !form.collapsedSteps[i] };
        update("collapsedSteps", novoEstado);
    };

    const toggleHighlightCollapse = (i: number) => {
        const novoEstado = { ...form.collapsedHighlights, [i]: !form.collapsedHighlights[i] };
        update("collapsedHighlights", novoEstado);
    };

    const { data: existingTemplate } = useTemplate(id || duplicateId || "");
    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate();

    useEffect(() => {
        if (existingTemplate) {
            const content = (existingTemplate.content || {}) as Record<string, any>;
            const blocks = (existingTemplate.blocks || {}) as Record<string, any>;

            setForm({
                name: duplicateId ? `${existingTemplate.name} (cópia)` : existingTemplate.name,
                objective: existingTemplate.objective,
                strategy: content.strategy || "",
                duration: content.duration || "",
                whatsappUrl: content.whatsappUrl || "",
                supportHours: content.supportHours || "",
                notes: content.notes || "",
                hasTreino: blocks.hasTreino ?? true,
                hasPsicologa: blocks.hasPsicologa ?? false,
                hasBioimpedancia: blocks.hasBioimpedancia ?? false,
                hasAreaMembros: blocks.hasAreaMembros ?? true,
                hasApps: blocks.hasApps ?? true,
                webdietLogin: content.credentials?.webdietLogin || "",
                webdietPassword: content.credentials?.webdietPassword || "",
                mfitLogin: content.credentials?.mfitLogin || "",
                mfitPassword: content.credentials?.mfitPassword || "",
                membersLink: content.membersLink || "",
                steps: content.steps || [],
                stepsTitle: content.stepsTitle || "📋 PRÓXIMOS PASSOS",
                hideStepsTitle: content.hideStepsTitle ?? false,
                guidelinesTitle: content.guidelines?.title || "📌 Orientações Importantes",
                hideGuidelinesTitle: content.guidelines?.hideGuidelinesTitle ?? false,
                hideHighlightsTitle: content.guidelines?.hideHighlightsTitle ?? false,
                guidelinesContent: content.guidelines?.content || "",
                guidelinesHighlights: (content.guidelines?.highlights || []).map((h: any) =>
                    typeof h === "string" ? { title: "Destaque", content: h } : h
                ),
                faqs: content.faqs || [],
                optionalBlocks: blocks.optionalBlocks || [],
                links: content.links || [],
                sectionOrder: normalizeSectionOrder(content.sectionOrder || DEFAULT_SECTION_ORDER),
                collapsedSteps: content.collapsedSteps || {},
                collapsedHighlights: content.collapsedHighlights || {},
                collapsedOptionalBlocks: content.collapsedOptionalBlocks || {},
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
                extrasImageUrl: content.extrasImageUrl || "",
                video: content.video || { url: "", buttonLabel: "", buttonUrl: "" },
                editorCollapse: (content.editorCollapse && typeof content.editorCollapse === "object") ? content.editorCollapse : {},
                standardBlocksOpen: Array.isArray(content.standardBlocksOpen) ? content.standardBlocksOpen : null,
            });
        }
    }, [existingTemplate, duplicateId]);

    const update = (field: keyof TemplateForm, value: any) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Nome do template é obrigatório!");
            return;
        }

        const sb = form.standardBlocks;
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
                webdietLogin: sb.planoAlimentar.login || "",
                webdietPassword: sb.planoAlimentar.password || "",
                mfitLogin: sb.treino.login || "",
                mfitPassword: sb.treino.password || "",
            },
            membersLink: sb.areaMembros.url || form.membersLink,
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
            video: form.video,
            editorCollapse: form.editorCollapse,
            standardBlocksOpen: form.standardBlocksOpen,
        };

        const blocks: TemplateBlocks = {
            hasTreino: sb.treino.enabled,
            hasPsicologa: sb.psicologa.enabled,
            hasBioimpedancia: sb.bioimpedancia.enabled,
            hasAreaMembros: sb.areaMembros.enabled,
            hasApps: sb.planoAlimentar.enabled,
            optionalBlocks: form.optionalBlocks as any,
        };

        try {
            if (isEditing && id) {
                await updateMutation.mutateAsync({
                    id,
                    name: form.name,
                    objective: form.objective as any,
                    content: content as unknown as Json,
                    blocks: blocks as unknown as Json,
                });
                toast.success("Template atualizado!");
            } else {
                await createMutation.mutateAsync({
                    name: form.name,
                    objective: form.objective as any,
                    content: content as unknown as Json,
                    blocks: blocks as unknown as Json,
                    created_by: user?.id ?? null,
                });
                toast.success("Template criado!");
            }
            navigate("/admin/templates");
        } catch (err: any) {
            toast.error(err.message || "Erro ao salvar.");
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
        newBlocks.splice(i + 1, 0, { ...blockToClone, title: `${blockToClone.title} (Cópia)` });
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
                    <RouterLink to="/admin/templates" className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </RouterLink>
                    <div className="flex items-center gap-2">
                        <LivePreviewModal formData={form} isTemplate={true} />
                        <button onClick={handleSave} className="px-5 py-2.5 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold hover:shadow-gold transition-all">
                            <Save className="w-3 h-3 inline mr-1" />
                            {isEditing ? "Salvar" : "Criar Template"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <h1 className="font-display text-2xl text-foreground">
                        {isEditing ? "EDITAR TEMPLATE" : duplicateId ? "DUPLICAR TEMPLATE" : "NOVO TEMPLATE"}
                    </h1>

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
                                        const url = `${window.location.origin}/aluno/[nome-do-aluno]`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Link genérico (template) copiado!");
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
                                        placeholder="Texto de envio padrão..."
                                        style={{ minHeight: '150px' }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Basic info */}
                    <div className="p-5 rounded-lg bg-card border border-border space-y-4">
                        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Informações Básicas</h2>
                        <div>
                            <label className="text-xs text-muted-foreground font-medium">Nome do Template</label>
                            <input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Ex: Emagrecimento Padrão" />
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
                                <label className="text-xs text-muted-foreground font-medium">Duração Padrão</label>
                                <input value={form.duration} onChange={(e) => update("duration", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="12 meses" />
                            </div>
                        </div>
                    </div>

                    <PageEditorSections form={form} update={update} />
                </motion.div>
            </main>
        </div>
    );
};

export default EditTemplate;
