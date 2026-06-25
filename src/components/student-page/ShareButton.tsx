import { useState, useEffect } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
    studentName: string;
}

const ShareButton = ({ studentName }: ShareButtonProps) => {
    const [copied, setCopied] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Mostrar o botão após um pequeno delay para a página carregar
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const handleShare = async () => {
        const url = window.location.href;
        const title = `Bem-vindo(a), ${studentName.split(" ")[0]}!`;
        const text = "Sua página exclusiva de acompanhamento e acesso aos aplicativos está pronta.";

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                });
                return;
            } catch (err) {
                // Se o usuário cancelar ou falhar, tentamos copiar o link como fallback
                console.log("Compartilhamento cancelado ou não suportado", err);
            }
        }

        // Fallback: Copiar para a área de transferência
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copiado para a área de transferência!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Não foi possível copiar o link.");
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShare}
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full shadow-lg transition-colors bg-card border border-border hover:border-gold hover:shadow-gold/20 group"
                    title="Compartilhar Página"
                >
                    {copied ? (
                        <Check className="w-6 h-6 text-emerald-500" />
                    ) : (
                        <Share2 className="w-6 h-6 text-foreground group-hover:text-gold transition-colors" />
                    )}
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ShareButton;
