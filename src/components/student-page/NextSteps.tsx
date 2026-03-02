import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface NextStepsProps {
  steps: Step[];
  hideTitle?: boolean;
  title?: string;
}

const NextSteps = ({ steps, hideTitle, title }: NextStepsProps) => {
  return (
    <section className="px-4 sm:px-8 py-10 gradient-dark">
      <div className="max-w-lg mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl text-white mb-6"
        >
          {title || "📋 PRÓXIMOS PASSOS"}
        </motion.h3>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="flex gap-4 items-start"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                  <span className="font-display text-lg text-primary-foreground">{String(index + 1).padStart(2, '0')}</span>
                </div>
              </div>
              <div className="flex-1 pb-4 border-b border-white/10">
                {!hideTitle && step.title && (
                  <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                )}
                <div className="text-white text-sm mt-1 quill-content force-white-text" dangerouslySetInnerHTML={{ __html: step.description }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NextSteps;
