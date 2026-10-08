import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, MessageCircle, BookOpen, Clock } from "lucide-react";
import bannerImage from "@/assets/fabricio-welcome.png";
import FooterSection from "@/components/student-page/FooterSection";
import { ONBOARDING, type Objetivo } from "@/config/onboarding";

// Página PADRONIZADA de boas-vindas: sem banco, sem edição por aluno.
// Personaliza só pelo link: ?nome=Rafael&obj=hipertrofia|emagrecimento|recomposicao

function appStoreUrl(): string {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && "ontouchend" in document)) return ONBOARDING.links.ios;
  return ONBOARDING.links.android;
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <motion.h2 {...fadeUp} className="font-display text-2xl sm:text-3xl text-white mb-6">
    {children}
  </motion.h2>
);

const BemVindo = () => {
  const [params] = useSearchParams();
  const nome = capitalize((params.get("nome") || "").trim().split(/\s+/)[0] || "");
  const objParam = (params.get("obj") || "").toLowerCase() as Objetivo;
  const estrategia = ONBOARDING.estrategia.porObjetivo[objParam] || ONBOARDING.estrategia.generico;
  const appUrl = useMemo(appStoreUrl, []);
  const c = ONBOARDING;

  const AppButton = ({ className = "" }: { className?: string }) => (
    <a
      href={appUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg gradient-gold text-primary-foreground font-semibold text-base hover:shadow-gold transition-all ${className}`}
    >
      <Smartphone className="w-5 h-5" />
      {c.hero.botaoApp}
    </a>
  );

  return (
    <div className="min-h-screen gradient-dark pb-24 sm:pb-0">
      {/* 1) Hero */}
      <section className="relative overflow-hidden bg-black">
        <img src={bannerImage} alt="Fabricio Moura - Bem-vindo" className="block w-full h-auto max-w-3xl mx-auto" />
      </section>
      <section className="px-4 sm:px-8 pt-8 pb-10">
        <div className="max-w-lg mx-auto text-center">
          <motion.h1 {...fadeUp} className="font-display text-3xl sm:text-4xl gradient-gold-text mb-3">
            {nome ? c.hero.tituloComNome.replace("{nome}", nome) : c.hero.tituloSemNome}
          </motion.h1>
          <p className="text-white/75 text-sm sm:text-base mb-6">{c.hero.subtitulo}</p>
          <AppButton className="w-full sm:w-auto sm:mx-auto" />
        </div>
      </section>

      {/* 2) Comece em 3 passos */}
      <section className="px-4 sm:px-8 py-10 border-t border-white/10">
        <div className="max-w-lg mx-auto">
          <SectionTitle>{c.passos.titulo}</SectionTitle>
          <div className="space-y-4">
            {c.passos.itens.map((p, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                  <span className="font-display text-lg text-primary-foreground">{i + 1}</span>
                </div>
                <div className="flex-1 pb-4 border-b border-white/10">
                  <h3 className="font-semibold text-white text-sm">{p.titulo}</h3>
                  <p className="text-white/70 text-sm mt-1">{p.texto}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3) Sua estratégia */}
      <section className="px-4 sm:px-8 py-10 border-t border-white/10">
        <div className="max-w-lg mx-auto">
          <SectionTitle>{c.estrategia.titulo}</SectionTitle>
          <motion.p {...fadeUp} className="text-white/80 text-sm leading-relaxed p-5 rounded-lg bg-white/5 border border-gold/30">
            {estrategia}
          </motion.p>
        </div>
      </section>

      {/* 4) Regras de ouro */}
      <section className="px-4 sm:px-8 py-10 border-t border-white/10">
        <div className="max-w-lg mx-auto">
          <SectionTitle>{c.regras.titulo}</SectionTitle>
          <ol className="space-y-3">
            {c.regras.itens.map((r, i) => (
              <motion.li key={i} {...fadeUp} transition={{ delay: i * 0.08 }} className="flex gap-3 text-sm text-white/80">
                <span className="font-display text-xl gradient-gold-text leading-none w-6 flex-shrink-0">{i + 1}</span>
                <span>{r}</span>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5) Linha do tempo */}
      <section className="px-4 sm:px-8 py-10 border-t border-white/10">
        <div className="max-w-lg mx-auto">
          <SectionTitle>{c.linhaDoTempo.titulo}</SectionTitle>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gold/40" />
            {c.linhaDoTempo.itens.map((t, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="relative pb-5 last:pb-0">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full gradient-gold" />
                <div className="text-xs font-semibold uppercase tracking-wide text-gold">{t.quando}</div>
                <p className="text-white/80 text-sm mt-0.5">{t.texto}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6) O que está incluso */}
      <section className="px-4 sm:px-8 py-10 border-t border-white/10">
        <div className="max-w-lg mx-auto">
          <SectionTitle>{c.incluso.titulo}</SectionTitle>
          <ul className="grid gap-2.5">
            {c.incluso.itens.map((it, i) => (
              <motion.li key={i} {...fadeUp} transition={{ delay: i * 0.05 }} className="flex items-start gap-2.5 text-sm text-white/85">
                <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                <span>{it}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7) Suporte */}
      {c.links.whatsappSuporte && (
        <section className="px-4 sm:px-8 py-10 border-t border-white/10">
          <motion.div {...fadeUp} className="max-w-lg mx-auto p-6 rounded-lg bg-white/5 border border-white/10 text-center">
            <h2 className="font-display text-2xl text-white mb-2">{c.suporte.titulo}</h2>
            <p className="text-white/70 text-sm mb-3">{c.suporte.texto}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 text-xs text-white/80 mb-4">
              <Clock className="w-3.5 h-3.5" /> {c.suporte.horario}
            </div>
            <a
              href={c.links.whatsappSuporte}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all mx-auto w-fit"
            >
              <MessageCircle className="w-5 h-5" /> {c.suporte.botao}
            </a>
          </motion.div>
        </section>
      )}

      {/* 8) Quer ir além? */}
      <section className="px-4 sm:px-8 py-10 border-t border-white/10">
        <motion.div {...fadeUp} className="max-w-lg mx-auto text-center">
          <h2 className="font-display text-2xl text-white mb-2">{c.alemDisso.titulo}</h2>
          <p className="text-white/70 text-sm mb-4">{c.alemDisso.texto}</p>
          <a
            href={c.links.areaMembros}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gold/60 text-gold font-semibold text-sm hover:bg-gold/10 transition-all"
          >
            <BookOpen className="w-5 h-5" /> {c.alemDisso.botao}
          </a>
        </motion.div>
      </section>

      <FooterSection />

      {/* Botão fixo no rodapé (celular) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-black/85 backdrop-blur border-t border-white/10">
        <AppButton className="w-full" />
      </div>
    </div>
  );
};

export default BemVindo;
