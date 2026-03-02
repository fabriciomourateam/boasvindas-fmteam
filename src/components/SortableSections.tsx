import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";

export const DEFAULT_SECTION_ORDER = [
    "summary",
    "steps",
    "links",
    "credentials",
    "guidelines",
    "optionalBlocks",
    "support"
];

export const SECTION_LABELS: Record<string, string> = {
    summary: "Resumo do Plano (Objetivo, Estratégia)",
    steps: "Próximos Passos",
    links: "Links Padrão e Adicionais",
    credentials: "Credenciais de Apps",
    guidelines: "Orientações e Destaques",
    optionalBlocks: "Blocos Opcionais / Customizados",
    support: "Área de Suporte (WhatsApp / FAQs)",
};

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

    return (
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
                                        <span className="text-foreground">{SECTION_LABELS[item]}</span>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default SortableSections;
