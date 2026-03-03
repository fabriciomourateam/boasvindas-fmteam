import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface GuidelinesBlockProps {
  title?: string;
  icon?: string;
  content: string;
  highlights?: Array<string | { title: string; content: string }>;
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

          <div
            className="text-foreground/80 text-sm leading-relaxed quill-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {highlights && highlights.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-semibold text-foreground mb-4">DESTAQUE</h4>
              <ul className="space-y-3">
                {highlights.map((highlight, index) => {
                  const contentHtml = typeof highlight === "string" ? highlight : highlight.content;
                  return (
                    <li key={index} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                      <div className="text-foreground/80 text-sm quill-content leading-tight" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default GuidelinesBlock;
