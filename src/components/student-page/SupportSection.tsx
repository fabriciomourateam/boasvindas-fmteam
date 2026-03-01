import { motion } from "framer-motion";
import { MessageCircle, HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface SupportSectionProps {
  whatsappUrl?: string;
  faqs?: FAQ[];
  supportHours?: string;
}

const SupportSection = ({ whatsappUrl, faqs, supportHours }: SupportSectionProps) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="px-4 sm:px-8 py-10 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Support block */}
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

        {/* FAQs */}
        {faqs && faqs.length > 0 && (
          <div>
            <h3 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gold" />
              DÚVIDAS FREQUENTES
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-sm text-foreground">{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SupportSection;
