import { motion } from "framer-motion";
import { Dumbbell, Brain, Activity, BookOpen, Smartphone, FileText } from "lucide-react";

interface OptionalBlock {
  type: "treino" | "psicologa" | "bioimpedancia" | "area_membros" | "apps" | "extras";
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
  extras: <FileText className="w-6 h-6" />,
};

const blockColors: Record<string, string> = {
  treino: "from-primary to-gold-dark",
  psicologa: "from-purple-500 to-purple-700",
  bioimpedancia: "from-emerald-500 to-emerald-700",
  area_membros: "from-primary to-gold-dark",
  apps: "from-blue-500 to-blue-700",
  extras: "from-primary to-gold-dark",
};

const OptionalBlocks = ({ blocks }: OptionalBlocksProps) => {
  if (blocks.length === 0) return null;

  return (
    <section className="px-4 sm:px-8 py-10 bg-secondary/50">
      <div className="max-w-lg mx-auto space-y-4">
        {blocks.map((block, index) => (
          <motion.div
            key={index}
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
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  {block.link && (
                    <a
                      href={block.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all text-center"
                    >
                      {block.linkLabel || "Acessar"} →
                    </a>
                  )}
                  {block.link2 && (
                    <a
                      href={block.link2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 outline outline-1 outline-border transition-all text-center"
                    >
                      {block.linkLabel2 || "Acessar"} →
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default OptionalBlocks;
