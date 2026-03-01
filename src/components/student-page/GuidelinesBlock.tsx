import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface GuidelinesBlockProps {
  title?: string;
  icon?: string;
  content: string;
  highlights?: string[];
}

const GuidelinesBlock = ({ title = "📌 Orientações Importantes", icon, content, highlights }: GuidelinesBlockProps) => {
  return (
    <section className="px-4 sm:px-8 py-8 bg-background">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 rounded-lg border border-gold/20 bg-gold/5"
        >
          <h3 className="font-display text-xl sm:text-2xl text-foreground mb-4">
            {icon || ""} {title}
          </h3>

          <div className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">
            {content}
          </div>

          {highlights && highlights.length > 0 && (
            <div className="mt-4 space-y-2">
              {highlights.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 text-gold-dark mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground/80">{item}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GuidelinesBlock;
