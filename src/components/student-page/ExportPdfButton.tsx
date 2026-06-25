import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { exportElementToPdf } from "@/lib/exportPdf";

interface ExportPdfButtonProps {
  studentName: string;
  /** Seletor ou ref do container a exportar. Default: a raiz da página do aluno. */
  targetSelector?: string;
  /** Quando true, usa posicionamento estático (dentro de um modal) em vez de fixo. */
  inline?: boolean;
}

const ExportPdfButton = ({ studentName, targetSelector = "#student-page-root", inline }: ExportPdfButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const el = document.querySelector(targetSelector) as HTMLElement | null;
    if (!el) {
      toast.error("Não foi possível localizar a página para exportar.");
      return;
    }
    setLoading(true);
    toast.loading("Gerando PDF...", { id: "pdf" });
    try {
      await exportElementToPdf(el, `boas-vindas-${studentName}`);
      toast.success("PDF gerado!", { id: "pdf" });
    } catch (err) {
      console.error("Erro ao gerar PDF", err);
      toast.error("Não foi possível gerar o PDF.", { id: "pdf" });
    } finally {
      setLoading(false);
    }
  };

  if (inline) {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-gold text-sm text-foreground hover:text-gold transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        Exportar PDF
      </button>
    );
  }

  return (
    <motion.button
      data-html2canvas-ignore
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleExport}
      disabled={loading}
      className="fixed bottom-24 right-6 z-50 flex items-center justify-center p-4 rounded-full shadow-lg transition-colors bg-card border border-border hover:border-gold hover:shadow-gold/20 group disabled:opacity-60"
      title="Exportar em PDF"
    >
      {loading ? (
        <Loader2 className="w-6 h-6 text-gold animate-spin" />
      ) : (
        <FileDown className="w-6 h-6 text-foreground group-hover:text-gold transition-colors" />
      )}
    </motion.button>
  );
};

export default ExportPdfButton;
