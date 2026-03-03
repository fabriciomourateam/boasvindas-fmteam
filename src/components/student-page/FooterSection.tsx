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
          <div className="mb-6 flex justify-center">
            <img src="/logo-footer.png" alt="FM Nutrição e Treinamento" className="h-8 md:h-10 w-auto object-contain" />
          </div>

          <p className="text-white/80 text-xs mb-6">
            Seu sucesso depende de mim e o meu sucesso depende de você.
          </p>

          <p className="text-white/30 text-xs mt-8">
            © {new Date().getFullYear()} Fabricio Moura • Nutrição e Treinamento
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default FooterSection;
