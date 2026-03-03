import { motion } from "framer-motion";
import { ExternalLink, Smartphone, BookOpen, MessageCircle, Users } from "lucide-react";

interface LinkItem {
  label: string;
  url: string;
  icon?: string;
  description?: string;
}

interface LinksBlockProps {
  title?: string;
  links: LinkItem[];
}

const iconMap: Record<string, React.ReactNode> = {
  app: <Smartphone className="w-5 h-5" />,
  members: <BookOpen className="w-5 h-5" />,
  support: <MessageCircle className="w-5 h-5" />,
  community: <Users className="w-5 h-5" />,
  default: <ExternalLink className="w-5 h-5" />,
};

const LinksBlock = ({ title = "🔗 Links Importantes", links }: LinksBlockProps) => {
  return (
    <section className="px-4 sm:px-8 py-10 bg-background">
      <div className="max-w-lg mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl text-foreground mb-6"
        >
          {title}
        </motion.h3>

        <div className="grid gap-3">
          {links.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden flex items-center gap-4 p-5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-gold/60 hover:shadow-[0_4px_30px_rgba(255,215,0,0.15)] transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Brilho interno do card ao hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 w-14 h-14 rounded-xl gradient-gold flex items-center justify-center flex-shrink-0 text-primary-foreground group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all duration-300">
                {iconMap[link.icon || "default"] || iconMap.default}
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="font-semibold text-foreground text-base tracking-wide group-hover:text-gold transition-colors">{link.label}</p>
                {link.description && (
                  <p className="text-muted-foreground text-sm mt-1">{link.description}</p>
                )}
              </div>
              <ExternalLink className="relative z-10 w-5 h-5 text-muted-foreground/60 group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LinksBlock;
