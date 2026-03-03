import { motion } from "framer-motion";
import { Dumbbell, Brain, Activity, BookOpen, Smartphone, FileText, Target } from "lucide-react";

interface OptionalBlock {
  type: "treino" | "psicologa" | "bioimpedancia" | "area_membros" | "apps" | "checkin" | "extras";
  title: string;
  content: string;
  link?: string;
  linkLabel?: string;
  link2?: string;
  linkLabel2?: string;
  imageUrl?: string;
}

interface OptionalBlocksProps {
  blocks: OptionalBlock[];
}

const blockIcons: Record<string, React.ReactNode> = {
  treino: <Dumbbell className="w-6 h-6" />,
  psicologa: <Brain className="w-6 h-6" />,
  bioimpedancia: <Activity className="w-6 h-6" />,
  area_membros: <BookOpen className="w-6 h-6" />,
  apps: <Smartphone className="w-6 h-6" />,
  checkin: <Target className="w-6 h-6" />,
  extras: <FileText className="w-6 h-6" />,
};

const blockColors: Record<string, string> = {
  treino: "from-primary to-gold-dark",
  psicologa: "from-purple-500 to-purple-700",
  bioimpedancia: "from-emerald-500 to-emerald-700",
  area_membros: "from-primary to-gold-dark",
  apps: "from-blue-500 to-blue-700",
  checkin: "from-rose-500 to-rose-700",
  extras: "from-primary to-gold-dark",
};

const OptionalBlocks = ({ blocks }: OptionalBlocksProps) => {
  if (blocks.length === 0) return null;

  return (
    <section className="px-4 sm:px-8 py-10 bg-secondary/50">
      <div className="max-w-lg mx-auto space-y-4">
        {blocks.map((block, index) => (
          <div key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              <div className={`p-4 bg-gradient-to-r ${blockColors[block.type] || blockColors.extras} flex items-center gap-3`}>
                <div className="text-white">{blockIcons[block.type] || blockIcons.extras}</div>
                <h4 className="font-display text-xl text-white">{block.title}</h4>
              </div>
              {block.imageUrl && (
                <div className="w-full relative border-b border-border bg-black/5">
                  <img src={block.imageUrl} alt={block.title} className="w-full object-contain max-h-[500px]" />
                </div>
              )}
              <div className="p-5">
                <div className="text-foreground/80 text-sm leading-relaxed quill-content" dangerouslySetInnerHTML={{ __html: block.content }} />

                {(block.link || block.link2) && (
                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    {block.link && (
                      <a
                        href={block.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-premium text-[15px] group"
                      >
                        {block.linkLabel || "Acessar"}
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    )}
                    {block.link2 && (
                      <a
                        href={block.link2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-premium-secondary text-[15px] group"
                      >
                        {block.linkLabel2 || "Acessar"}
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Divisória Premium entre cards (não mostra no último elemento) */}
            {index < blocks.length - 1 && (
              <div className="flex items-center justify-center my-10">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold"></div>
                <div className="mx-4 w-2 h-2 rotate-45 border border-gold bg-gold/20"></div>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default OptionalBlocks;
