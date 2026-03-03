import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Copy, Plus, ChevronDown, ChevronRight } from "lucide-react";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import { motion, AnimatePresence } from "framer-motion";

export interface CustomBlock {
    type: string;
    title: string;
    content: string;
    link?: string;
    linkLabel?: string;
    link2?: string;
    linkLabel2?: string;
    imageUrl?: string;
}

interface SortableCustomBlocksProps {
    blocks: CustomBlock[];
    onChange: (newBlocks: CustomBlock[]) => void;
}

const SortableCustomBlocks = ({ blocks, onChange }: SortableCustomBlocksProps) => {
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const newBlocks = Array.from(blocks);
        const [reorderedBlock] = newBlocks.splice(sourceIndex, 1);
        newBlocks.splice(destinationIndex, 0, reorderedBlock);

        // Ajustar os estados de collapse para acompanhar a nova ordem
        const newCollapsed: Record<number, boolean> = {};
        newBlocks.forEach((_, index) => {
            // old index of this item
            let oldIndex = index;
            if (index === destinationIndex) oldIndex = sourceIndex;
            else if (sourceIndex < destinationIndex && index >= sourceIndex && index < destinationIndex) oldIndex = index + 1;
            else if (sourceIndex > destinationIndex && index > destinationIndex && index <= sourceIndex) oldIndex = index - 1;

            newCollapsed[index] = collapsed[oldIndex] || false;
        });
        setCollapsed(newCollapsed);

        onChange(newBlocks);
    };

    const updateBlock = (i: number, field: string, value: string) => {
        const newBlocks = blocks.map((b, idx) => (idx === i ? { ...b, [field]: value } : b));
        onChange(newBlocks);
    };

    const removeBlock = (i: number) => {
        const newBlocks = blocks.filter((_, idx) => idx !== i);
        onChange(newBlocks);

        // Shift collapsed state
        const newCollapsed: Record<number, boolean> = {};
        newBlocks.forEach((_, idx) => {
            newCollapsed[idx] = collapsed[idx >= i ? idx + 1 : idx] || false;
        });
        setCollapsed(newCollapsed);
    };

    const duplicateBlock = (i: number) => {
        const blockToClone = blocks[i];
        const newBlocks = [...blocks];
        newBlocks.splice(i + 1, 0, { ...blockToClone, title: `${blockToClone.title} (Cópia)` });
        onChange(newBlocks);
    };

    const addBlock = () => {
        onChange([...blocks, { type: "extras", title: "", content: "" }]);
        setCollapsed(prev => ({ ...prev, [blocks.length]: false })); // Novas entram abertas
    };

    const toggleCollapse = (i: number) => {
        setCollapsed(prev => ({ ...prev, [i]: !prev[i] }));
    };

    return (
        <div className="p-5 rounded-lg bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">🧩 Blocos Customizados</h2>
                <button onClick={addBlock} className="flex items-center gap-1 text-xs text-gold hover:text-gold-dark transition-colors">
                    <Plus className="w-3 h-3" /> Adicionar
                </button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="custom-blocks">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-3"
                        >
                            {blocks.map((block, i) => (
                                <Draggable key={`block-${i}`} draggableId={`block-${i}`} index={i}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`p-4 rounded-lg border transition-colors ${snapshot.isDragging
                                                    ? "bg-secondary border-gold shadow-gold ring-1 ring-gold/50 z-10"
                                                    : "bg-secondary border-border"
                                                }`}
                                        >
                                            {/* Header do Bloco (Sempre visível) */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-gold p-1">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>

                                                <button
                                                    onClick={() => toggleCollapse(i)}
                                                    className="p-1 hover:bg-background rounded-md text-foreground transition-colors"
                                                >
                                                    {collapsed[i] ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>

                                                <select
                                                    value={block.type}
                                                    onChange={(e) => updateBlock(i, "type", e.target.value)}
                                                    className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground font-medium"
                                                >
                                                    <option value="treino">Treino</option>
                                                    <option value="psicologa">Psicóloga</option>
                                                    <option value="bioimpedancia">Bioimpedância</option>
                                                    <option value="area_membros">Área de Membros</option>
                                                    <option value="apps">Apps</option>
                                                    <option value="extras">Extras</option>
                                                </select>

                                                <input
                                                    value={block.title}
                                                    onChange={(e) => updateBlock(i, "title", e.target.value)}
                                                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground font-medium"
                                                    placeholder="Título do bloco"
                                                />

                                                <div className="flex gap-1 ml-auto">
                                                    <button onClick={() => duplicateBlock(i)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-background rounded-md transition-colors" title="Duplicar">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => removeBlock(i)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-background rounded-md transition-colors" title="Excluir">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Corpo do Bloco (Colapsável) */}
                                            <AnimatePresence initial={false}>
                                                {!collapsed[i] && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-3 border-t border-border mt-3 space-y-3">
                                                            {block.imageUrl && (
                                                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                                                                    <img src={block.imageUrl} alt="Capa do bloco" className="w-full h-full object-cover" />
                                                                    <button onClick={() => updateBlock(i, "imageUrl", "")} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}

                                                            <RichTextEditor value={block.content} onChange={(val) => updateBlock(i, "content", val)} placeholder="Conteúdo do bloco customizado..." />

                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <input value={block.link || ""} onChange={(e) => updateBlock(i, "link", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Link Primário (opcional)" />
                                                                <input value={block.linkLabel || ""} onChange={(e) => updateBlock(i, "linkLabel", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Texto (ex: iOS App)" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <input value={block.link2 || ""} onChange={(e) => updateBlock(i, "link2", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Link Secundário (opcional)" />
                                                                <input value={block.linkLabel2 || ""} onChange={(e) => updateBlock(i, "linkLabel2", e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Texto (ex: Android App)" />
                                                            </div>
                                                            <div className="mt-2">
                                                                <ImageUpload onUpload={(url) => updateBlock(i, "imageUrl", url)} label={block.imageUrl ? "Trocar Imagem" : "Adicionar Imagem de Capa"} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            {blocks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg border-border">Nenhum bloco customizado.</p>}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default SortableCustomBlocks;
