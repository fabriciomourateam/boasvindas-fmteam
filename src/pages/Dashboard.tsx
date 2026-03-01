import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Eye, Edit2, Copy, MoreVertical, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  rascunho: "bg-muted text-muted-foreground",
  revisado: "bg-blue-100 text-blue-700",
  enviado: "bg-emerald-100 text-emerald-700",
  inativo: "bg-destructive/10 text-destructive",
};

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  revisado: "Revisado",
  enviado: "Enviado",
  inativo: "Inativo",
};

const demoPages = [
  { id: "1", name: "Eduardo Santos", objective: "Recomposição", plan: "Premium", status: "enviado", createdAt: "2026-02-28", createdBy: "Fabricio", slug: "eduardo-santos" },
  { id: "2", name: "Maria Silva", objective: "Emagrecimento", plan: "Shape", status: "revisado", createdAt: "2026-02-27", createdBy: "Ana", slug: "maria-silva" },
  { id: "3", name: "João Oliveira", objective: "Hipertrofia", plan: "Premium", status: "rascunho", createdAt: "2026-02-26", createdBy: "Fabricio", slug: "joao-oliveira" },
];

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const navigate = useNavigate();

  const filteredPages = demoPages.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "todos" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/aluno/${slug}`);
    toast.success("Link copiado!");
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="gradient-dark px-4 sm:px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <span className="font-display text-2xl gradient-gold-text">FM</span>
            <span className="text-white font-display text-lg ml-1">PAINEL</span>
          </div>
          <button
            onClick={() => navigate("/admin/criar")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Página</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: demoPages.length, color: "text-foreground" },
            { label: "Enviados", value: demoPages.filter(p => p.status === "enviado").length, color: "text-emerald-600" },
            { label: "Revisados", value: demoPages.filter(p => p.status === "revisado").length, color: "text-blue-600" },
            { label: "Rascunhos", value: demoPages.filter(p => p.status === "rascunho").length, color: "text-muted-foreground" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-card border border-border text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome do aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex gap-2">
            {["todos", "rascunho", "revisado", "enviado"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  filterStatus === status
                    ? "gradient-gold text-primary-foreground border-transparent"
                    : "bg-card text-muted-foreground border-border hover:border-gold/50"
                }`}
              >
                {status === "todos" ? "Todos" : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Page List */}
        <div className="space-y-3">
          {filteredPages.map((page, index) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg bg-card border border-border hover:border-gold/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground text-sm truncate">{page.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[page.status]}`}>
                      {statusLabels[page.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{page.objective}</span>
                    <span>•</span>
                    <span>{page.plan}</span>
                    <span>•</span>
                    <span>{page.createdBy}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{page.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/aluno/${page.slug}`)}
                    className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyLink(page.slug)}
                    className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="Copiar link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredPages.length === 0 && (
            <div className="text-center py-16">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma página encontrada.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
