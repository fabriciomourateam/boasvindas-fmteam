import { motion } from "framer-motion";
import { Target, Calendar, Award } from "lucide-react";

interface PlanSummaryProps {
  objective: string;
  plan: string;
  duration?: string;
  strategy?: string;
}

const PlanSummary = ({ objective, plan, duration, strategy }: PlanSummaryProps) => {
  return (
    <section className="px-4 sm:px-8 py-10 bg-background">
      <div className="max-w-lg mx-auto space-y-4">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl text-foreground"
        >
          ORIENTAÇÕES INICIAIS
        </motion.h3>

        <div className="grid gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-secondary"
          >
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Objetivo</span>
              <p className="font-semibold text-foreground">{objective}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-secondary"
          >
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Plano</span>
              <p className="font-semibold text-foreground">{plan}</p>
            </div>
          </motion.div>

          {duration && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 p-4 rounded-lg bg-secondary"
            >
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Duração</span>
                <p className="font-semibold text-foreground">{duration}</p>
              </div>
            </motion.div>
          )}
        </div>

        {strategy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-lg border border-gold/20 bg-gold/5"
          >
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gold-dark mb-2">🧠 Estratégia Inicial</h4>
            <div className="text-foreground text-sm leading-relaxed quill-content" dangerouslySetInnerHTML={{ __html: strategy }} />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PlanSummary;
