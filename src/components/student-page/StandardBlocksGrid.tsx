import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Activity, Utensils, Dumbbell, Target, Brain, BookOpen, Copy, Eye, EyeOff, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import type { StandardBlocksData, StandardBlockKey } from "@/pages/CreatePage";
import { DEFAULT_STANDARD_BLOCKS_ORDER } from "@/pages/CreatePage";

const META: Record<StandardBlockKey, { label: string; icon: React.ReactNode; gradient: string; glow: string }> = {
  bioimpedancia: {
    label: "Bioimpedância",
    icon: <Activity className="w-9 h-9" strokeWidth={1.75} />,
    gradient: "from-emerald-400 via-emerald-600 to-teal-700",
    glow: "shadow-[0_10px_40px_-12px_rgba(16,185,129,0.55)]",
  },
  planoAlimentar: {
    label: "Plano Alimentar",
    icon: <Utensils className="w-9 h-9" strokeWidth={1.75} />,
    gradient: "from-sky-400 via-blue-600 to-indigo-700",
    glow: "shadow-[0_10px_40px_-12px_rgba(59,130,246,0.55)]",
  },
  treino: {
    label: "Treino",
    icon: <Dumbbell className="w-9 h-9" strokeWidth={1.75} />,
    gradient: "from-amber-300 via-yellow-500 to-amber-700",
    glow: "shadow-[0_10px_40px_-12px_rgba(245,158,11,0.6)]",
  },
  checkins: {
    label: "Check-ins",
    icon: <Target className="w-9 h-9" strokeWidth={1.75} />,
    gradient: "from-rose-400 via-pink-600 to-rose-800",
    glow: "shadow-[0_10px_40px_-12px_rgba(244,63,94,0.55)]",
  },
  psicologa: {
    label: "Psicóloga",
    icon: <Brain className="w-9 h-9" strokeWidth={1.75} />,
    gradient: "from-fuchsia-400 via-purple-600 to-violet-800",
    glow: "shadow-[0_10px_40px_-12px_rgba(168,85,247,0.55)]",
  },
  areaMembros: {
    label: "Área de Membros",
    icon: <BookOpen className="w-9 h-9" strokeWidth={1.75} />,
    gradient: "from-amber-300 via-orange-500 to-amber-700",
    glow: "shadow-[0_10px_40px_-12px_rgba(251,146,60,0.55)]",
  },
};

interface StandardBlocksGridProps {
  data: StandardBlocksData;
  order?: StandardBlockKey[];
}

const StandardBlocksGrid = ({ data, order }: StandardBlocksGridProps) => {
  const [openKey, setOpenKey] = useState<StandardBlockKey | null>(null);

  const finalOrder = order && order.length > 0 ? order : DEFAULT_STANDARD_BLOCKS_ORDER;
  const visibleKeys = finalOrder.filter((k) => data[k]?.enabled);
  if (visibleKeys.length === 0) return null;

  const isOdd = visibleKeys.length % 2 === 1;

  const activeBlock = openKey ? data[openKey] : null;
  const activeMeta = openKey ? META[openKey] : null;

  return (
    <section className="px-4 sm:px-8 py-12 bg-gradient-to-b from-secondary/30 via-background to-secondary/30">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {visibleKeys.map((key, i) => {
            const meta = META[key];
            const isLastOdd = isOdd && i === visibleKeys.length - 1;
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setOpenKey(key)}
                className={`group relative overflow-hidden rounded-3xl aspect-square ${isLastOdd ? "col-span-2 aspect-[2/1]" : ""} ${meta.glow} hover:shadow-[0_18px_55px_-12px_rgba(0,0,0,0.45)] transition-shadow duration-300`}
              >
                {/* Gradient base */}
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
                {/* Highlight diagonal */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/25 mix-blend-overlay" />
                {/* Shine sweep on hover */}
                <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-0 group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
                </div>
                {/* Inner border */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/20" />

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center gap-3 px-3 py-4 text-white">
                  <div className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">{meta.icon}</div>
                  <div className="font-display text-base sm:text-lg leading-tight text-center tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
                    {meta.label}
                  </div>
                </div>

                {/* Corner indicator */}
                <div className="absolute top-2.5 right-2.5 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/25">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Dialog open={openKey !== null} onOpenChange={(open) => !open && setOpenKey(null)}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border rounded-2xl">
          {activeMeta && activeBlock && openKey && (
            <>
              <div className={`relative px-5 py-5 bg-gradient-to-br ${activeMeta.gradient} flex items-center gap-3 overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 mix-blend-overlay" />
                <div className="relative text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">{activeMeta.icon}</div>
                <DialogTitle className="relative font-display text-2xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">{activeMeta.label}</DialogTitle>
              </div>
              <div className="p-5 space-y-4">
                {(activeBlock as any).imageUrl && (
                  <div className="w-full rounded-xl overflow-hidden border border-border bg-black/5">
                    <img src={(activeBlock as any).imageUrl} alt={activeMeta.label} className="w-full object-contain max-h-[60vh]" />
                  </div>
                )}
                {(activeBlock as any).description && (
                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{(activeBlock as any).description}</div>
                )}
                {((activeBlock as any).login || (activeBlock as any).password) && (
                  <CredentialsList login={(activeBlock as any).login} password={(activeBlock as any).password} />
                )}
                {((activeBlock as any).androidUrl || (activeBlock as any).iosUrl) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {(activeBlock as any).androidUrl && (
                      <a href={(activeBlock as any).androidUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-premium text-[15px] text-center">
                        Android →
                      </a>
                    )}
                    {(activeBlock as any).iosUrl && (
                      <a href={(activeBlock as any).iosUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-premium-secondary text-[15px] text-center">
                        iOS →
                      </a>
                    )}
                  </div>
                )}
                {openKey === "areaMembros" && (activeBlock as any).url && (
                  <a
                    href={(activeBlock as any).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full btn-premium text-[15px]"
                  >
                    Acessar Área de Membros →
                  </a>
                )}
                {!(activeBlock as any).imageUrl && !(activeBlock as any).description && !(activeBlock as any).login && !(activeBlock as any).password && !(activeBlock as any).androidUrl && !(activeBlock as any).iosUrl && !(openKey === "areaMembros" && (activeBlock as any).url) && (
                  <p className="text-sm text-muted-foreground text-center py-6">Conteúdo não configurado.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

const CredentialsList = ({ login, password }: { login?: string; password?: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <div className="space-y-2">
      {login && (
        <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
          <div className="min-w-0 flex-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Login</span>
            <p className="text-sm font-mono font-semibold text-foreground break-all">{login}</p>
          </div>
          <button onClick={() => copy(login, "Login")} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      )}
      {password && (
        <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
          <div className="min-w-0 flex-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Senha</span>
            <p className="text-sm font-mono font-semibold text-foreground break-all">
              {showPassword ? password : "••••••••"}
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => setShowPassword(!showPassword)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={() => copy(password, "Senha")} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardBlocksGrid;
