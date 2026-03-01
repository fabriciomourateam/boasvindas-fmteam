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
              className="group flex items-center gap-4 p-4 rounded-lg border border-border hover:border-gold/50 bg-card hover:shadow-gold transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0 text-primary-foreground group-hover:scale-105 transition-transform">
                {iconMap[link.icon || "default"] || iconMap.default}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{link.label}</p>
                {link.description && (
                  <p className="text-muted-foreground text-xs mt-0.5">{link.description}</p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors flex-shrink-0" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LinksBlock;
