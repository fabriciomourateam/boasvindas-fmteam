import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Copy, ArrowLeft, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { useRequireAuth } from "@/hooks/useAuth";
import { useTemplates, useDeleteTemplate } from "@/hooks/useTemplates";

const objectiveLabels: Record<string, string> = {
    emagrecimento: "Emagrecimento",
    recomposicao: "Recomposição Corporal",
    hipertrofia: "Hipertrofia",
};

const objectiveColors: Record<string, string> = {
    emagrecimento: "bg-rose-100 text-rose-700 border-rose-200",
    recomposicao: "bg-blue-100 text-blue-700 border-blue-200",
    hipertrofia: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TemplatesPage = () => {
    const navigate = useNavigate();
    const [filterObjective, setFilterObjective] = useState("todos");
    useRequireAuth();

    const { data: templates = [], isLoading } = useTemplates();
    const deleteMutation = useDeleteTemplate();

    const filteredTemplates = templates.filter((t) => {
        if (filterObjective === "todos") return true;
        return t.objective === filterObjective;
    });

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Excluir o template "${name}"?`)) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Template excluído!");
        } catch {
            toast.error("Erro ao excluir.");
        }
    };

    const handleDuplicate = async (template: any) => {
        // Navigate to create with template pre-loaded
        navigate(`/admin/templates/criar?duplicar=${template.id}`);
    };

    return (
        <div className="min-h-screen bg-secondary/30">
            <header className="gradient-dark px-4 sm:px-8 py-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate("/admin")} className="text-white/60 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <span className="font-display text-2xl gradient-gold-text">FM</span>
                            <span className="text-white font-display text-lg ml-1">TEMPLATES</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/admin/templates/criar")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Novo Template</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {["todos", "emagrecimento", "recomposicao", "hipertrofia"].map((obj) => (
                        <button
                            key={obj}
                            onClick={() => setFilterObjective(obj)}
                            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${filterObjective === obj
                                    ? "gradient-gold text-primary-foreground border-transparent"
                                    : "bg-card text-muted-foreground border-border hover:border-gold/50"
                                }`}
                        >
                            {obj === "todos" ? "Todos" : objectiveLabels[obj]}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="text-center py-16">
                        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                )}

                {/* Template grid */}
                {!isLoading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template, index) => {
                            const content = (template.content || {}) as Record<string, any>;
                            const blocks = (template.blocks || {}) as Record<string, any>;
                            const enabledBlocks = [
                                blocks.hasTreino && "Treino",
                                blocks.hasPsicologa && "Psicóloga",
                                blocks.hasBioimpedancia && "Bioimpedância",
                                blocks.hasAreaMembros && "Área de Membros",
                                blocks.hasApps && "Apps",
                            ].filter(Boolean);

                            return (
                                <motion.div
                                    key={template.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-5 rounded-lg bg-card border border-border hover:border-gold/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground text-sm truncate">{template.name}</h3>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${objectiveColors[template.objective] || ""}`}>
                                                {objectiveLabels[template.objective] || template.objective}
                                            </span>
                                        </div>
                                        <LayoutTemplate className="w-5 h-5 text-gold/50 flex-shrink-0" />
                                    </div>

                                    {content.strategy && (
                                        <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                                            {content.strategy}
                                        </p>
                                    )}

                                    {enabledBlocks.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {enabledBlocks.map((b) => (
                                                <span key={b as string} className="px-2 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 border-t border-border pt-3 mt-3">
                                        <button
                                            onClick={() => navigate(`/admin/templates/${template.id}/editar`)}
                                            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDuplicate(template)}
                                            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                            title="Duplicar"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id, template.name)}
                                            className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {filteredTemplates.length === 0 && !isLoading && (
                            <div className="col-span-full text-center py-16">
                                <LayoutTemplate className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">
                                    {templates.length === 0
                                        ? "Nenhum template criado. Crie o primeiro!"
                                        : "Nenhum template encontrado para esse filtro."}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TemplatesPage;
