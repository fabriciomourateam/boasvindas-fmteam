import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Image as ImageIcon, Trash2, CheckSquare2, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GalleryImage {
    name: string;
    url: string;
    id: string;
    created_at: string;
}

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

const ImageGalleryModal = ({ isOpen, onClose, onSelect }: ImageGalleryModalProps) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
            setSelected(new Set());
        }
    }, [isOpen]);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from('template_images')
                .list();

            if (error) throw error;

            if (data) {
                const validFiles = data.filter(file => file.name !== '.emptyFolderPlaceholder');

                const imagesWithUrls = await Promise.all(
                    validFiles.map(async (file) => {
                        const { data: { publicUrl } } = supabase.storage
                            .from('template_images')
                            .getPublicUrl(file.name);

                        return {
                            name: file.name,
                            url: publicUrl,
                            id: file.id,
                            created_at: file.created_at
                        };
                    })
                );

                setImages(imagesWithUrls.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ));
            }
        } catch (error: any) {
            console.error('Error fetching gallery images:', error);
            toast.error("Erro ao carregar galeria.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, fileName: string) => {
        e.stopPropagation();
        if (!confirm('Deseja realmente apagar esta imagem permanentemente?')) return;

        setIsDeleting(fileName);
        try {
            const { error } = await supabase.storage
                .from('template_images')
                .remove([fileName]);

            if (error) throw error;

            toast.success("Imagem removida com sucesso!");
            setImages(prev => prev.filter(img => img.name !== fileName));
            setSelected(prev => {
                const next = new Set(prev);
                next.delete(fileName);
                return next;
            });
        } catch (error: any) {
            console.error('Error deleting image:', error);
            toast.error("Erro ao remover imagem.");
        } finally {
            setIsDeleting(null);
        }
    };

    const toggleSelect = (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === images.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(images.map(i => i.name)));
        }
    };

    const handleBulkDelete = async () => {
        const names = Array.from(selected);
        if (names.length === 0) return;
        if (!confirm(`Apagar ${names.length} ${names.length === 1 ? "imagem" : "imagens"} permanentemente?`)) return;

        setIsBulkDeleting(true);
        try {
            const { error } = await supabase.storage
                .from('template_images')
                .remove(names);

            if (error) throw error;

            toast.success(`${names.length} ${names.length === 1 ? "imagem removida" : "imagens removidas"}!`);
            setImages(prev => prev.filter(img => !selected.has(img.name)));
            setSelected(new Set());
        } catch (error: any) {
            console.error('Error bulk deleting images:', error);
            toast.error("Erro ao remover imagens.");
        } finally {
            setIsBulkDeleting(false);
        }
    };

    if (!isOpen) return null;

    const hasSelection = selected.size > 0;
    const allSelected = images.length > 0 && selected.size === images.length;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-3xl bg-card border border-border shadow-lg rounded-xl overflow-hidden flex flex-col max-h-[85vh]"
                >
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-gold" />
                            Galeria de Mídia
                        </h2>
                        <div className="flex items-center gap-2">
                            {images.length > 0 && (
                                <button
                                    onClick={selectAll}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                >
                                    {allSelected ? <CheckSquare2 className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    {allSelected ? "Desmarcar todas" : "Selecionar todas"}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-1 rounded-md hover:bg-secondary text-muted-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin text-gold" />
                                <p className="text-sm">Carregando imagens...</p>
                            </div>
                        ) : images.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                                <ImageIcon className="w-12 h-12 opacity-20" />
                                <p className="text-sm">Nenhuma imagem enviada ainda.</p>
                                <p className="text-xs">Faça upload de uma imagem em um template para ela aparecer aqui.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((img) => {
                                    const isSelected = selected.has(img.name);
                                    return (
                                        <div
                                            key={img.id}
                                            onClick={() => {
                                                if (hasSelection) {
                                                    // No modo seleção, clique no card também toggles
                                                    setSelected(prev => {
                                                        const next = new Set(prev);
                                                        if (next.has(img.name)) next.delete(img.name); else next.add(img.name);
                                                        return next;
                                                    });
                                                } else {
                                                    onSelect(img.url);
                                                    onClose();
                                                }
                                            }}
                                            className={`group relative aspect-square rounded-lg border bg-secondary overflow-hidden cursor-pointer transition-all ${isSelected ? "border-gold ring-2 ring-gold" : "border-border hover:border-gold"}`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />

                                            {/* Checkbox no canto sup-esq (sempre visível ao passar mouse OU quando há seleção) */}
                                            <button
                                                onClick={(e) => toggleSelect(e, img.name)}
                                                className={`absolute top-2 left-2 p-1 rounded-md bg-black/60 hover:bg-black/80 text-white transition-opacity ${hasSelection || isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                                                title={isSelected ? "Desmarcar" : "Marcar"}
                                            >
                                                {isSelected ? <CheckSquare2 className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4" />}
                                            </button>

                                            {/* Overlay "Selecionar" — só aparece quando não há seleção ativa */}
                                            {!hasSelection && (
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                    <span className="text-white text-xs font-medium px-2 py-1 bg-black/50 rounded-md">
                                                        Selecionar
                                                    </span>
                                                </div>
                                            )}

                                            {/* Botão excluir individual */}
                                            <button
                                                onClick={(e) => handleDelete(e, img.name)}
                                                disabled={isDeleting === img.name}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-destructive text-white rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                                                title="Excluir da galeria"
                                            >
                                                {isDeleting === img.name ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Barra de ação para multi-select */}
                    <AnimatePresence>
                        {hasSelection && (
                            <motion.div
                                initial={{ y: 60, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 60, opacity: 0 }}
                                className="border-t border-border bg-card p-3 flex items-center justify-between gap-3"
                            >
                                <div className="text-sm text-foreground">
                                    <span className="font-semibold">{selected.size}</span>{" "}
                                    {selected.size === 1 ? "imagem selecionada" : "imagens selecionadas"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelected(new Set())}
                                        className="px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isBulkDeleting}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {isBulkDeleting ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                        Apagar {selected.size}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ImageGalleryModal;
