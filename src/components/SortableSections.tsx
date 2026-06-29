import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, EyeOff, Plus } from "lucide-react";

export const DEFAULT_SECTION_ORDER = [
    "summary",
    "steps",
    "standardButtons",
    "links",
    "guidelines",
    "optionalBlocks",
    "support",
    "extras"
];

export const SECTION_LABELS: Record<string, string> = {
    summary: "Resumo do Plano (Objetivo, Estratégia)",
    steps: "Próximos Passos",
    standardButtons: "Botões (Bioimpedância, Plano, Treino, etc.)",
    links: "Links Padrão e Adicionais",
    guidelines: "Orientações e Destaques",
    optionalBlocks: "Blocos Opcionais / Customizados",
    support: "Área de Suporte (WhatsApp)",
    extras: "Imagem Final (Extras)",
};

/**
 * Normaliza sectionOrder:
 *  - Remove valores inválidos (ex: 'credentials' legado)
 *  - Se o array estiver vazio/ausente, devolve o default completo
 *  - Caso contrário, respeita a escolha do usuário e SÓ insere automaticamente 'standardButtons'
 *    (seção nova que foi adicionada depois — alunos/templates antigos não tinham). As demais
 *    seções, se o usuário tiver removido, ficam removidas.
 */
export function normalizeSectionOrder(raw: any): string[] {
    const valid = new Set(DEFAULT_SECTION_ORDER);
    const seen = new Set<string>();
    const filtered: string[] = Array.isArray(raw)
        ? raw.filter((s: any) => {
            if (typeof s !== "string") return false;
            if (!valid.has(s)) return false;
            if (seen.has(s)) return false;
            seen.add(s);
            return true;
        })
        : [];
    if (filtered.length === 0) return [...DEFAULT_SECTION_ORDER];
    // Auto-insere apenas 'standardButtons' (seção nova). Posição: antes da próxima seção
    // que já está no filtered (segundo a ordem default).
    if (!filtered.includes("standardButtons")) {
        const defaultIdx = DEFAULT_SECTION_ORDER.indexOf("standardButtons");
        let insertAt = filtered.length;
        for (let i = defaultIdx + 1; i < DEFAULT_SECTION_ORDER.length; i++) {
            const next = DEFAULT_SECTION_ORDER[i];
            const idx = filtered.indexOf(next);
            if (idx >= 0) { insertAt = idx; break; }
        }
        filtered.splice(insertAt, 0, "standardButtons");
    }
    // Auto-insere 'extras' (Imagem Final) no fim — seção nova; antes ficava fixa no rodapé.
    if (!filtered.includes("extras")) {
        filtered.push("extras");
    }
    return filtered;
}

interface SortableSectionsProps {
    items: string[];
    onChange: (newItems: string[]) => void;
}

const SortableSections = ({ items, onChange }: SortableSectionsProps) => {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        if (sourceIndex === destinationIndex) return;

        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(sourceIndex, 1);
        newItems.splice(destinationIndex, 0, reorderedItem);

        onChange(newItems);
    };

    // Ensure items are full and valid, map them for rendering
    const validItems = items.filter(item => SECTION_LABELS[item]);

    // Ocultas são as que estão no DEFAULT_SECTION_ORDER mas não no validItems
    const hiddenItems = DEFAULT_SECTION_ORDER.filter(item => !validItems.includes(item));

    const handleHide = (itemToHide: string) => {
        onChange(items.filter(item => item !== itemToHide));
    };

    const handleRestore = (itemToRestore: string) => {
        onChange([...items, itemToRestore]);
    };

    return (
        <div className="space-y-4">
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {validItems.map((item, index) => (
                                <Draggable key={item} draggableId={item} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`flex items-center gap-3 p-3 rounded-md border text-sm font-medium transition-colors ${snapshot.isDragging
                                                ? "bg-secondary border-gold shadow-gold ring-1 ring-gold/50 z-10"
                                                : "bg-background border-border hover:border-gold/30 hover:bg-secondary/50"
                                                }`}
                                        >
                                            <div
                                                {...provided.dragHandleProps}
                                                className="cursor-grab hover:text-gold active:cursor-grabbing text-muted-foreground p-1"
                                            >
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <span className="text-foreground flex-1">{SECTION_LABELS[item]}</span>

                                            <button
                                                onClick={() => handleHide(item)}
                                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-background rounded-md transition-colors"
                                                title="Ocultar esta seção (não será exibida)"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {hiddenItems.length > 0 && (
                <div className="pt-4 border-t border-border border-dashed">
                    <p className="text-xs text-muted-foreground mb-3">Seções ocultas (clique para restaurar):</p>
                    <div className="flex flex-wrap gap-2">
                        {hiddenItems.map(item => (
                            <button
                                key={`hidden-${item}`}
                                onClick={() => handleRestore(item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-border bg-secondary hover:bg-background hover:text-gold hover:border-gold/50 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                {SECTION_LABELS[item]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SortableSections;
