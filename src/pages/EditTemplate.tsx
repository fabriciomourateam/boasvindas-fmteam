import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, AlertCircle, Plus, Trash2, ArrowLeft, Eye, X, GripVertical, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useAuth";
import {
    useTemplate,
    useCreateTemplate,
    useUpdateTemplate,
} from "@/hooks/useTemplates";
import type { TemplateContent, TemplateBlocks } from "@/hooks/useTemplates";
import type { Json } from "@/integrations/supabase/types";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import SortableSections, { DEFAULT_SECTION_ORDER } from "@/components/SortableSections";
import LivePreviewModal from "@/components/LivePreviewModal";

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
    steps: Array<{ title: string; description: string }>;
    stepsTitle: string;
    hideStepsTitle: boolean;
    guidelinesContent: string;
    guidelinesHighlights: string[];
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
    steps: [],
    stepsTitle: "📋 PRÓXIMOS PASSOS",
    hideStepsTitle: false,
    guidelinesContent: "",
    guidelinesHighlights: [],
    faqs: [],
    optionalBlocks: [],
    links: [],
    sectionOrder: DEFAULT_SECTION_ORDER,
};

const EditTemplate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const duplicateId = searchParams.get("duplicar");
    const isEditing = !!id;
    const { user } = useRequireAuth();

    const [form, setForm] = useState<TemplateForm>({ ...defaultForm });

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
                steps: content.steps || [],
                stepsTitle: content.stepsTitle || "📋 PRÓXIMOS PASSOS",
                hideStepsTitle: content.hideStepsTitle ?? false,
                guidelinesContent: content.guidelines?.content || "",
                guidelinesHighlights: content.guidelines?.highlights || [],
                faqs: content.faqs || [],
                optionalBlocks: blocks.optionalBlocks || [],
                links: content.links || [],
                sectionOrder: content.sectionOrder || DEFAULT_SECTION_ORDER,
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

        const content: TemplateContent = {
            strategy: form.strategy,
            duration: form.duration,
            steps: form.steps,
            stepsTitle: form.stepsTitle,
            hideStepsTitle: form.hideStepsTitle,
            guidelines: {
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
            supportHours: form.supportHours,
            whatsappUrl: form.whatsappUrl,
            notes: form.notes,
            sectionOrder: form.sectionOrder,
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

    const addHighlight = () => update("guidelinesHighlights", [...form.guidelinesHighlights, ""]);
    const removeHighlight = (i: number) => update("guidelinesHighlights", form.guidelinesHighlights.filter((_, idx) => idx !== i));

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
                    <button onClick={() => navigate("/admin/templates")} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>
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

                    {/* Ordenação */}
                    <div className="p-5 rounded-lg bg-card border border-border space-y-4">
                        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🔄 Ordenação das Seções</h2>
                        <p className="text-xs text-muted-foreground">Arraste para reordenar como as seções aparecerão na página do aluno.</p>
                        <SortableSections items={form.sectionOrder} onChange={(newOrder) => update("sectionOrder", newOrder)} />
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

                    {form.sectionOrder.map((section) => {
                        switch (section) {
                            case "summary":
                                return (
                                    <div key="summary" className="p-5 rounded-lg bg-card border border-border space-y-4">
                                        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🧠 Estratégia Base</h2>
                                        <RichTextEditor value={form.strategy} onChange={(val) => update("strategy", val)} placeholder="Texto base da estratégia (suporta formatação)..." />
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
                                        {form.steps.map((step, i) => (
                                            <div key={i} className="flex gap-2">
                                                <div className="flex-1 space-y-2">
                                                    <input value={step.title} onChange={(e) => updateStep(i, "title", e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Título" />
                                                    <RichTextEditor value={step.description} onChange={(val) => updateStep(i, "description", val)} placeholder="Descrição com formatação (suporta tópicos, negrito)..." />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <button onClick={() => duplicateStep(i)} className="p-2 text-muted-foreground hover:text-foreground transition-colors self-start pb-0" title="Duplicar">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => removeStep(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors self-start pt-1" title="Excluir">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {form.steps.length === 0 && <p className="text-xs text-muted-foreground">Nenhum passo adicionado.</p>}
                                    </div>
                                );
                            case "optionalBlocks":
                                return (
                                    <div key="optionalBlocks" className="space-y-6">
                                        <div className="p-5 rounded-lg bg-card border border-border space-y-3">
                                            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Blocos Opcionais Padrão</h2>
                                            {[
                                                { key: "hasTreino", label: "Treino" },
                                                { key: "hasPsicologa", label: "Psicóloga" },
                                                { key: "hasBioimpedancia", label: "Bioimpedância" },
                                                { key: "hasAreaMembros", label: "Área de Membros" },
                                                { key: "hasApps", label: "Apps (WebDiet / MFit)" },
                                            ].map(({ key, label }) => (
                                                <label key={key} className="flex items-center justify-between p-3 rounded-md bg-secondary cursor-pointer">
                                                    <span className="text-sm text-foreground">{label}</span>
                                                    <input type="checkbox" checked={(form as any)[key]} onChange={(e) => update(key as any, e.target.checked)} className="w-5 h-5 rounded accent-gold" />
                                                </label>
                                            ))}
                                        </div>

                                        <div className="p-5 rounded-lg bg-card border border-border space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🧩 Blocos Customizados</h2>
                                                <button onClick={addOptionalBlock} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                                                    <Plus className="w-3 h-3" /> Adicionar
                                                </button>
                                            </div>
                                            {form.optionalBlocks.map((block, i) => (
                                                <div key={i} className="p-4 rounded-lg bg-secondary space-y-2">
                                                    <div className="flex gap-2">
                                                        <select value={block.type} onChange={(e) => updateOptionalBlock(i, "type", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                                                            <option value="treino">Treino</option>
                                                            <option value="psicologa">Psicóloga</option>
                                                            <option value="bioimpedancia">Bioimpedância</option>
                                                            <option value="area_membros">Área de Membros</option>
                                                            <option value="apps">Apps</option>
                                                            <option value="extras">Extras</option>
                                                        </select>
                                                        <input value={block.title} onChange={(e) => updateOptionalBlock(i, "title", e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Título" />
                                                        <div className="flex gap-1">
                                                            <button onClick={() => duplicateOptionalBlock(i)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Duplicar">
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => removeOptionalBlock(i)} className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {block.imageUrl && (
                                                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border mb-2">
                                                            <img src={block.imageUrl} alt="Capa do bloco" className="w-full h-full object-cover" />
                                                            <button onClick={() => updateOptionalBlock(i, "imageUrl", "")} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <RichTextEditor value={block.content} onChange={(val) => updateOptionalBlock(i, "content", val)} placeholder="Conteúdo do bloco..." />
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <input value={block.link || ""} onChange={(e) => updateOptionalBlock(i, "link", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Link (opcional)" />
                                                        <input value={block.linkLabel || ""} onChange={(e) => updateOptionalBlock(i, "linkLabel", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Texto do link" />
                                                    </div>
                                                    <div className="mt-2">
                                                        <ImageUpload onUpload={(url) => updateOptionalBlock(i, "imageUrl", url)} label={block.imageUrl ? "Trocar Imagem" : "Adicionar Imagem de Capa"} />
                                                    </div>
                                                </div>
                                            ))}
                                            {form.optionalBlocks.length === 0 && <p className="text-xs text-muted-foreground">Nenhum bloco customizado.</p>}
                                        </div>
                                    </div>
                                );
                            case "links":
                                return (
                                    <div key="links" className="p-5 rounded-lg bg-card border border-border space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🔗 Links Padrão</h2>
                                            <button onClick={addLink} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                                                <Plus className="w-3 h-3" /> Adicionar
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-muted-foreground font-medium">WhatsApp Suporte</label>
                                                <input value={form.whatsappUrl} onChange={(e) => update("whatsappUrl", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="https://wa.me/..." />
                                            </div>
                                            <div>
                                                <label className="text-xs text-muted-foreground font-medium">Horário Suporte</label>
                                                <input value={form.supportHours} onChange={(e) => update("supportHours", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Seg-Sex: 08-18h" />
                                            </div>
                                        </div>
                                        {form.links.map((link, i) => (
                                            <div key={i} className="flex gap-2">
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Nome" />
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
                                        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🔐 Credenciais Padrão</h2>
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
                                    <div key="guidelines" className="p-5 rounded-lg bg-card border border-border space-y-4">
                                        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">📌 Orientações Base</h2>
                                        <RichTextEditor value={form.guidelinesContent} onChange={(val) => update("guidelinesContent", val)} placeholder="Orientações padrão para o aluno com suporte a formatação..." />
                                        <div className="flex items-center justify-between mt-4">
                                            <h3 className="text-xs text-muted-foreground font-medium">Destaques</h3>
                                            <button onClick={addHighlight} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                                                <Plus className="w-3 h-3" /> Adicionar
                                            </button>
                                        </div>
                                        {form.guidelinesHighlights.map((h, i) => (
                                            <div key={i} className="flex gap-2">
                                                <div className="flex-1">
                                                    <RichTextEditor value={h} onChange={(val) => { const arr = [...form.guidelinesHighlights]; arr[i] = val; update("guidelinesHighlights", arr); }} placeholder="Destaque com suporte a negrito e cores..." />
                                                </div>
                                                <button onClick={() => removeHighlight(i)} className="p-2 text-muted-foreground hover:text-destructive self-start">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                );
                            case "support":
                                return (
                                    <div key="support" className="p-5 rounded-lg bg-card border border-border space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">❓ FAQs Padrão</h2>
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


                    {/* Notes */}
                    <div className="p-5 rounded-lg bg-card border border-border space-y-4">
                        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">📝 Observações Padrão</h2>
                        <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground resize-none" placeholder="Notas adicionais do template..." />
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default EditTemplate;
