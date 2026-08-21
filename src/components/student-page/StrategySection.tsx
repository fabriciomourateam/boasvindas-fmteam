import { motion } from "framer-motion";

interface StrategySectionProps {
  strategy: string;
}

const StrategySection = ({ strategy }: StrategySectionProps) => {
  if (!strategy || !strategy.trim()) return null;

  return (
    <section className="px-4 sm:px-8 py-6 bg-background">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-5 rounded-lg border border-gold/20 bg-gold/5"
        >
          <h4 className="font-semibold text-sm uppercase tracking-wider text-gold-dark mb-2">🧠 Estratégia Inicial</h4>
          <div className="text-foreground text-sm leading-relaxed quill-content" dangerouslySetInnerHTML={{ __html: strategy }} />
        </motion.div>
      </div>
    </section>
  );
};

export default StrategySection;
