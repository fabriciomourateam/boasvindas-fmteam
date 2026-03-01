import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { toast } from "sonner";

const objectives = ["Emagrecimento", "Recomposição Corporal", "Hipertrofia"];
const plans = ["Shape", "Premium", "Premium Anual"];

const CreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    objective: objectives[0],
    plan: plans[0],
    hasTreino: true,
    hasPsicologa: false,
    hasBioimpedancia: false,
    hasAreaMembros: true,
    hasApps: true,
    membersLink: "",
    supportLink: "",
    appLogin: "",
    appPassword: "",
    mfitLogin: "",
    mfitPassword: "",
    notes: "",
  });

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = (status: string) => {
    toast.success(status === "rascunho" ? "Rascunho salvo!" : "Página publicada!");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="gradient-dark px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex gap-2">
            <button onClick={() => handleSave("rascunho")} className="px-4 py-2 rounded-lg border border-white/20 text-white text-xs font-medium hover:bg-white/5 transition-colors">
              <Save className="w-3 h-3 inline mr-1" /> Rascunho
            </button>
            <button onClick={() => handleSave("enviado")} className="px-4 py-2 rounded-lg gradient-gold text-primary-foreground text-xs font-semibold hover:shadow-gold transition-all">
              Publicar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h1 className="font-display text-2xl text-foreground">NOVA PÁGINA DE ALUNO</h1>

          {/* Basic info */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-4">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Dados do Aluno</h2>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Nome do Aluno</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground" placeholder="Nome completo" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Objetivo</label>
                <select value={form.objective} onChange={(e) => update("objective", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
                  {objectives.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Plano</label>
                <select value={form.plan} onChange={(e) => update("plan", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
                  {plans.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Toggle blocks */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-3">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Blocos Opcionais</h2>
            {[
              { key: "hasTreino", label: "Treino" },
              { key: "hasPsicologa", label: "Psicóloga" },
              { key: "hasBioimpedancia", label: "Bioimpedância" },
              { key: "hasAreaMembros", label: "Área de Membros" },
              { key: "hasApps", label: "Apps (WebDiet / MFit)" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-md bg-secondary cursor-pointer">
                <span className="text-sm text-foreground">{label}</span>
                <input
                  type="checkbox"
                  checked={(form as any)[key]}
                  onChange={(e) => update(key, e.target.checked)}
                  className="w-5 h-5 rounded accent-gold"
                />
              </label>
            ))}
          </div>

          {/* Links */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-4">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Links</h2>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Área de Membros</label>
              <input value={form.membersLink} onChange={(e) => update("membersLink", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Suporte WhatsApp</label>
              <input value={form.supportLink} onChange={(e) => update("supportLink", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="https://wa.me/..." />
            </div>
          </div>

          {/* Credentials */}
          {form.hasApps && (
            <div className="p-5 rounded-lg bg-card border border-border space-y-4">
              <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Credenciais dos Apps</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">WebDiet Login</label>
                  <input value={form.appLogin} onChange={(e) => update("appLogin", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">WebDiet Senha</label>
                  <input value={form.appPassword} onChange={(e) => update("appPassword", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">MFit Login</label>
                  <input value={form.mfitLogin} onChange={(e) => update("mfitLogin", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">MFit Senha</label>
                  <input value={form.mfitPassword} onChange={(e) => update("mfitPassword", e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="p-5 rounded-lg bg-card border border-border space-y-4">
            <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider">Observações</h2>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground resize-none"
              placeholder="Orientações personalizadas para este aluno..."
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CreatePage;
