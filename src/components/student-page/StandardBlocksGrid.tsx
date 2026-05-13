import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Activity, Utensils, Dumbbell, Target, Brain, BookOpen, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export interface StandardBlock {
  enabled: boolean;
  imageUrl?: string;
  login?: string;
  password?: string;
  androidUrl?: string;
  iosUrl?: string;
}

export interface AreaMembrosBlock {
  enabled: boolean;
  url?: string;
}

export interface StandardBlocksData {
  bioimpedancia: StandardBlock;
  planoAlimentar: StandardBlock;
  treino: StandardBlock;
  checkins: StandardBlock;
  psicologa: StandardBlock;
  areaMembros: AreaMembrosBlock;
}

type BlockKey = "bioimpedancia" | "planoAlimentar" | "treino" | "checkins" | "psicologa" | "areaMembros";

const META: Record<BlockKey, { label: string; icon: React.ReactNode; gradient: string }> = {
  bioimpedancia: { label: "Bioimpedância", icon: <Activity className="w-6 h-6" />, gradient: "from-emerald-500 to-emerald-700" },
  planoAlimentar: { label: "Plano Alimentar", icon: <Utensils className="w-6 h-6" />, gradient: "from-blue-500 to-blue-700" },
  treino: { label: "Treino", icon: <Dumbbell className="w-6 h-6" />, gradient: "from-primary to-gold-dark" },
  checkins: { label: "Check-ins", icon: <Target className="w-6 h-6" />, gradient: "from-rose-500 to-rose-700" },
  psicologa: { label: "Psicóloga", icon: <Brain className="w-6 h-6" />, gradient: "from-purple-500 to-purple-700" },
  areaMembros: { label: "Área de Membros", icon: <BookOpen className="w-6 h-6" />, gradient: "from-primary to-gold-dark" },
};

const ORDER: BlockKey[] = ["bioimpedancia", "planoAlimentar", "treino", "checkins", "psicologa", "areaMembros"];

interface StandardBlocksGridProps {
  data: StandardBlocksData;
}

const StandardBlocksGrid = ({ data }: StandardBlocksGridProps) => {
  const [openKey, setOpenKey] = useState<BlockKey | null>(null);

  const visibleKeys = ORDER.filter((k) => data[k]?.enabled);
  if (visibleKeys.length === 0) return null;

  const activeBlock = openKey ? data[openKey] : null;
  const activeMeta = openKey ? META[openKey] : null;

  const handleCardClick = (key: BlockKey) => {
    if (key === "areaMembros") {
      const url = (data.areaMembros.url || "").trim();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Link da Área de Membros não configurado.");
      }
      return;
    }
    setOpenKey(key);
  };

  return (
    <section className="px-4 sm:px-8 py-10 bg-secondary/50">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {visibleKeys.map((key, i) => {
            const meta = META[key];
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleCardClick(key)}
                className={`relative overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:shadow-gold transition-all aspect-[5/3] flex flex-col items-center justify-center gap-2 p-4 group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-90`} />
                <div className="relative text-white">{meta.icon}</div>
                <div className="relative font-display text-base sm:text-lg text-white text-center leading-tight">
                  {meta.label}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Dialog open={openKey !== null && openKey !== "areaMembros"} onOpenChange={(open) => !open && setOpenKey(null)}>
        <DialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background border border-border rounded-xl">
          {activeMeta && activeBlock && openKey && openKey !== "areaMembros" && (
            <>
              <div className={`px-5 py-4 bg-gradient-to-r ${activeMeta.gradient} flex items-center gap-3`}>
                <div className="text-white">{activeMeta.icon}</div>
                <DialogTitle className="font-display text-xl text-white">{activeMeta.label}</DialogTitle>
              </div>
              <div className="p-5 space-y-4">
                {activeBlock.imageUrl && (
                  <div className="w-full rounded-lg overflow-hidden border border-border bg-black/5">
                    <img src={activeBlock.imageUrl} alt={activeMeta.label} className="w-full object-contain max-h-[60vh]" />
                  </div>
                )}
                {(activeBlock.login || activeBlock.password) && (
                  <CredentialsList login={activeBlock.login} password={activeBlock.password} />
                )}
                {(activeBlock.androidUrl || activeBlock.iosUrl) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {activeBlock.androidUrl && (
                      <a href={activeBlock.androidUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-premium text-[15px] text-center">
                        Android →
                      </a>
                    )}
                    {activeBlock.iosUrl && (
                      <a href={activeBlock.iosUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-premium-secondary text-[15px] text-center">
                        iOS →
                      </a>
                    )}
                  </div>
                )}
                {!activeBlock.imageUrl && !activeBlock.login && !activeBlock.password && !activeBlock.androidUrl && !activeBlock.iosUrl && (
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
