import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface SupportSectionProps {
  whatsappUrl?: string;
  supportHours?: string;
}

const SupportSection = ({ whatsappUrl, supportHours }: SupportSectionProps) => {
  return (
    <section className="px-4 sm:px-8 py-10 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-lg gradient-dark text-white text-center"
        >
          <h3 className="font-display text-2xl mb-2">SUPORTE FMTEAM</h3>
          <p className="text-white/70 text-sm mb-2">
            Entre em contato sempre que precisar via WhatsApp.
          </p>
          {supportHours && (
            <div className="inline-block px-4 py-2 rounded-md bg-white/10 text-xs text-white/80 mb-4">
              {supportHours}
            </div>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 px-6 py-3 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all mx-auto w-fit"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default SupportSection;
