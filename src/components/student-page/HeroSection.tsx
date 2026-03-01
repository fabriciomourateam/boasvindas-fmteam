import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface HeroSectionProps {
  studentName: string;
  objective: string;
}

const HeroSection = ({ studentName, objective }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-end gradient-dark overflow-hidden">
      {/* Geometric gold accents */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
        <div className="w-full h-full gradient-gold" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
      </div>
      <div className="absolute bottom-20 left-0 w-32 h-32 opacity-10">
        <div className="w-full h-full gradient-gold" style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />
      </div>

      {/* Vertical "BEM VINDO" text */}
      <div className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 opacity-10">
        <span className="font-display text-6xl sm:text-8xl tracking-widest text-gold writing-vertical" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          BEM VINDO
        </span>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-8 pb-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-lg mx-auto text-center sm:text-left"
        >
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">
              Parabéns pela decisão
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl text-white leading-none mb-3">
            BEM VINDO,
          </h1>
          <h2 className="font-display text-3xl sm:text-5xl gradient-gold-text leading-none mb-6">
            {studentName}!
          </h2>

          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            Que vai acelerar a conquista dos seus objetivos!
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full gradient-gold px-5 py-2">
            <span className="font-semibold text-dark text-sm uppercase tracking-wide">
              Objetivo: {objective}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
