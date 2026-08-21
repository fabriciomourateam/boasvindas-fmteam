import { motion } from "framer-motion";
import { Target, Calendar, Award } from "lucide-react";

interface PlanSummaryProps {
  objective: string;
  plan: string;
  duration?: string;
  title?: string;
  hideObjective?: boolean;
  hidePlan?: boolean;
  hideDuration?: boolean;
}

const PlanSummary = ({
  objective,
  plan,
  duration,
  title,
  hideObjective,
  hidePlan,
  hideDuration,
}: PlanSummaryProps) => {
  const showObjective = !hideObjective && !!objective;
  const showPlan = !hidePlan && !!plan;
  const showDuration = !hideDuration && !!duration;

  // Sem nenhum card visível, a seção não renderiza (nem título órfão).
  if (!showObjective && !showPlan && !showDuration) return null;

  const heading = (title ?? "").trim();

  return (
    <section className="px-4 sm:px-8 py-10 bg-background">
      <div className="max-w-lg mx-auto space-y-4">
        {heading && (
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl text-foreground"
          >
            {heading}
          </motion.h3>
        )}

        <div className="grid gap-3">
          {showObjective && (
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
          )}

          {showPlan && (
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
          )}

          {showDuration && (
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
      </div>
    </section>
  );
};

export default PlanSummary;
