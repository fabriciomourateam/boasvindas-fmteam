import { useState } from "react";
import { ImagePlus, Loader2, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageGalleryModal from "./ImageGalleryModal";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    className?: string;
    label?: string;
}

const ImageUpload = ({ onUpload, className, label = "Adicionar Imagem" }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Por favor, selecione uma imagem válida (.png, .jpg, etc).");
            return;
        }

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('template_images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('template_images')
                .getPublicUrl(filePath);

            if (data?.publicUrl) {
                onUpload(data.publicUrl);
                toast.success("Imagem enviada com sucesso!");
            } else {
                throw new Error("Erro ao obter URL pública da imagem");
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            toast.error("Erro ao enviar imagem. Verifique se o bucket 'template_images' existe e é público.");
        } finally {
            setIsUploading(false);
            // Reset input
            if (e.target) e.target.value = '';
        }
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className || ''}`}>
            <div>
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
                <label htmlFor="image-upload">
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-secondary rounded-md cursor-pointer text-foreground">
                        {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gold" />
                        ) : (
                            <ImagePlus className="w-4 h-4 text-gold" />
                        )}
                        {isUploading ? "Enviando..." : label}
                    </div>
                </label>
            </div>

            <button
                type="button"
                onClick={() => setIsGalleryOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors border border-border bg-background hover:bg-secondary rounded-md cursor-pointer text-foreground"
            >
                <ImageIcon className="w-4 h-4 text-gold" />
                Galeria
            </button>

            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                onSelect={onUpload}
            />
        </div>
    );
};

export default ImageUpload;
