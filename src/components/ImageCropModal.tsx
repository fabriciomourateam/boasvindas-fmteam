import { useState, useRef, useEffect } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Crop as CropIcon, Scissors } from "lucide-react";

interface ImageCropModalProps {
    open: boolean;
    src: string;
    onClose: () => void;
    onCropped: (url: string) => void;
}

/**
 * Modal de corte de imagem.
 * O recorte é feito na RESOLUÇÃO ORIGINAL da imagem e exportado em PNG (sem
 * compressão com perda), então a parte que sobra mantém a qualidade original.
 */
export default function ImageCropModal({ open, src, onClose, onCropped }: ImageCropModalProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [objectUrl, setObjectUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Baixa a imagem como blob (object URL) para evitar "tainted canvas" por CORS na exportação.
    useEffect(() => {
        if (!open || !src) return;
        let revoke = "";
        setLoading(true);
        setCrop(undefined);
        setCompletedCrop(undefined);
        fetch(src)
            .then((r) => r.blob())
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                revoke = url;
                setObjectUrl(url);
            })
            .catch(() => setObjectUrl(src))
            .finally(() => setLoading(false));
        return () => {
            if (revoke) URL.revokeObjectURL(revoke);
        };
    }, [open, src]);

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const initial: PixelCrop = { unit: "px", x: 0, y: 0, width, height };
        setCrop(initial);
        setCompletedCrop(initial);
    };

    const handleConfirm = async () => {
        const image = imgRef.current;
        if (!image || !completedCrop || completedCrop.width < 1 || completedCrop.height < 1) {
            toast.error("Selecione a área para cortar.");
            return;
        }

        // Escala entre a imagem exibida (reduzida) e a resolução real.
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(completedCrop.width * scaleX);
        canvas.height = Math.round(completedCrop.height * scaleY);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            toast.error("Não foi possível processar a imagem.");
            return;
        }
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height,
        );

        setSaving(true);
        try {
            const blob: Blob = await new Promise((resolve, reject) =>
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem"))), "image/png"),
            );
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}_crop.png`;
            const { error } = await supabase.storage
                .from("template_images")
                .upload(fileName, blob, { upsert: true, contentType: "image/png" });
            if (error) throw error;
            const { data } = supabase.storage.from("template_images").getPublicUrl(fileName);
            if (!data?.publicUrl) throw new Error("URL pública não obtida");
            onCropped(data.publicUrl);
            toast.success("Imagem cortada e salva!");
            onClose();
        } catch (err) {
            console.error("Erro ao cortar imagem", err);
            toast.error("Erro ao cortar/enviar a imagem.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto bg-background border border-border">
                <DialogTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-gold" /> Cortar imagem
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                    Arraste para selecionar a parte que você quer manter. O corte usa a resolução original da imagem,
                    então não perde qualidade.
                </p>

                <div className="flex justify-center bg-black/5 rounded-lg p-2 min-h-[120px] items-center">
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-gold" />
                    ) : objectUrl ? (
                        <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                            <img
                                ref={imgRef}
                                src={objectUrl}
                                alt="Imagem para cortar"
                                crossOrigin="anonymous"
                                onLoad={onImageLoad}
                                className="max-h-[60vh] w-auto select-none"
                            />
                        </ReactCrop>
                    ) : null}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={saving || loading}
                        className="px-4 py-2 rounded-lg gradient-gold text-primary-foreground text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CropIcon className="w-4 h-4" />}
                        Cortar e salvar
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface CropButtonProps {
    src: string;
    onCropped: (url: string) => void;
    className?: string;
}

/** Botão "Cortar" que abre o modal de corte para a imagem informada. */
export function CropButton({ src, onCropped, className }: CropButtonProps) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={className || "absolute top-2 right-12 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"}
                title="Cortar imagem"
            >
                <Scissors className="w-4 h-4" />
            </button>
            {open && <ImageCropModal open={open} src={src} onClose={() => setOpen(false)} onCropped={onCropped} />}
        </>
    );
}
