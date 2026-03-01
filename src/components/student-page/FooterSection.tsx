import { motion } from "framer-motion";

const FooterSection = () => {
  return (
    <footer className="gradient-dark px-4 sm:px-8 py-10">
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-4">
            <span className="font-display text-3xl gradient-gold-text">FM</span>
            <span className="font-display text-xl text-white ml-1">NUTRIÇÃO E TREINAMENTO</span>
          </div>

          <p className="text-white/40 text-xs mb-6">
            Seu sucesso depende de mim e o meu sucesso depende de você.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-gold">
            <span className="font-display text-lg text-primary-foreground tracking-wide">BORA PRA CIMA 🎯</span>
          </div>

          <p className="text-white/30 text-xs mt-8">
            © {new Date().getFullYear()} Fabricio Moura • Nutrição e Treinamento
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;
