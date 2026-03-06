import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    availableTags?: string[];
    placeholder?: string;
    className?: string;
}

export function TagInput({
    value = [],
    onChange,
    availableTags = [],
    placeholder = "Selecione ou crie tags...",
    className,
}: TagInputProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleToggle = (tag: string) => {
        if (value.includes(tag)) {
            onChange(value.filter((t) => t !== tag));
        } else {
            onChange([...value, tag]);
        }
        // Não limpa o inputValue nem fecha para permitir selecionar várias
    };

    const handleCreateNew = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue("");
        }
    };

    const handleRemove = (tag: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((t) => t !== tag));
    };

    const hasExactMatch = availableTags.includes(inputValue.trim()) || value.includes(inputValue.trim());

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-[40px] px-3 py-2 font-normal hover:bg-transparent"
                    >
                        <div className="flex flex-wrap gap-1.5 flex-1 items-center">
                            {value.length === 0 && (
                                <span className="text-muted-foreground">{placeholder}</span>
                            )}
                            {value.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="rounded-sm px-1.5 py-0.5"
                                >
                                    {tag}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 rounded-full outline-none ring-offset-background hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onClick={(e) => handleRemove(tag, e)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleRemove(tag, e as any);
                                            }
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        <span className="sr-only">Remover {tag}</span>
                                    </div>
                                </Badge>
                            ))}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput
                            placeholder="Buscar tag ou digitar nova..."
                            value={inputValue}
                            onValueChange={setInputValue}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && inputValue.trim() && !hasExactMatch) {
                                    e.preventDefault();
                                    handleCreateNew();
                                }
                            }}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {inputValue.trim() ? (
                                    <div
                                        className="flex cursor-pointer items-center justify-between p-2 text-sm hover:bg-accent rounded-sm"
                                        onClick={() => {
                                            handleCreateNew();
                                            setOpen(false);
                                        }}
                                    >
                                        <span>Criar "{inputValue.trim()}"</span>
                                        <Plus className="h-4 w-4" />
                                    </div>
                                ) : (
                                    "Nenhuma tag encontrada."
                                )}
                            </CommandEmpty>
                            <CommandGroup>
                                {availableTags.map((tag) => (
                                    <CommandItem
                                        key={tag}
                                        value={tag}
                                        onSelect={() => handleToggle(tag)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 flex-shrink-0",
                                                value.includes(tag) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className="truncate">{tag}</span>
                                    </CommandItem>
                                ))}

                                {inputValue.trim() && !hasExactMatch && (
                                    <CommandItem
                                        value={`create_${inputValue}`}
                                        onSelect={() => {
                                            handleCreateNew();
                                            setOpen(false);
                                        }}
                                        className="text-primary font-medium"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <Plus className="h-4 w-4" />
                                            <span className="truncate">Criar "{inputValue.trim()}"</span>
                                        </div>
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

// Plus icon needed
function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    );
}
