import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Edit2, Copy, Trash2, FileText, LayoutTemplate, LogOut, ArrowLeft, Folder } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useStudentPages, useDeleteStudentPage } from "@/hooks/useStudentPages";
import { useRequireAuth } from "@/hooks/useAuth";

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

const objectiveLabels: Record<string, string> = {
  emagrecimento: "Emagrecimento",
  recomposicao: "Recomposição",
  hipertrofia: "Hipertrofia",
};

const planLabels: Record<string, string> = {
  shape: "Shape",
  premium: "Premium",
  premium_anual: "Premium Anual",
};

const Dashboard = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signOut } = useRequireAuth();

  const { data: pages = [], isLoading } = useStudentPages();
  const deleteMutation = useDeleteStudentPage();

  const allFolders = Array.from(new Set(pages.map(p => (p.custom_content as any)?.folder).filter(Boolean))) as string[];

  const searchedPages = pages.filter((p) => {
    const matchesSearch = p.student_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "todos" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const visibleFolders = allFolders.filter(f =>
    searchedPages.some(p => (p.custom_content as any)?.folder === f)
  );

  const pagesToDisplay = currentFolder
    ? searchedPages.filter(p => (p.custom_content as any)?.folder === currentFolder)
    : searchedPages.filter(p => !(p.custom_content as any)?.folder);

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/aluno/${slug}`);
    toast.success("Link copiado!");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a página de ${name}?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Página excluída!");
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const stats = {
    total: pages.length,
    enviados: pages.filter((p) => p.status === "enviado").length,
    revisados: pages.filter((p) => p.status === "revisado").length,
    rascunhos: pages.filter((p) => p.status === "rascunho").length,
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/admin/templates")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 text-white text-sm hover:bg-white/5 transition-colors"
            >
              <LayoutTemplate className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
            <button
              onClick={() => navigate("/admin/criar")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-gold text-primary-foreground font-semibold text-sm hover:shadow-gold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Página</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg border border-white/20 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Enviados", value: stats.enviados, color: "text-emerald-600" },
            { label: "Revisados", value: stats.revisados, color: "text-blue-600" },
            { label: "Rascunhos", value: stats.rascunhos, color: "text-muted-foreground" },
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
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${filterStatus === status
                  ? "gradient-gold text-primary-foreground border-transparent"
                  : "bg-card text-muted-foreground border-border hover:border-gold/50"
                  }`}
              >
                {status === "todos" ? "Todos" : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Carregando...</p>
          </div>
        )}

        {/* Page List & Folders */}
        {!isLoading && (
          <div className="space-y-6">

            {/* Folder Navigation */}
            {currentFolder && (
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar para todas as pastas
                </button>
                <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
                  <Folder className="w-4 h-4 text-gold" /> {currentFolder}
                </h2>
              </div>
            )}

            {/* Folders List */}
            {!currentFolder && visibleFolders.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pastas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {visibleFolders.map((folder, i) => {
                    const itemsInFolder = searchedPages.filter(p => (p.custom_content as any)?.folder === folder).length;
                    return (
                      <motion.button
                        key={folder}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setCurrentFolder(folder)}
                        className="flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border hover:border-gold hover:shadow-gold/10 transition-all text-center group"
                      >
                        <Folder className="w-10 h-10 text-gold mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-foreground text-sm truncate w-full">{folder}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{itemsInFolder} {itemsInFolder === 1 ? 'aluno' : 'alunos'}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pages List */}
            {(pagesToDisplay.length > 0 || !currentFolder) && (
              <div>
                {!currentFolder && visibleFolders.length > 0 && pagesToDisplay.length > 0 && (
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">Alunos sem pasta</h2>
                )}
                <div className="space-y-3">
                  {pagesToDisplay.map((page, index) => (
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
                            <h3 className="font-semibold text-foreground text-sm truncate">{page.student_name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[page.status]}`}>
                              {statusLabels[page.status]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{objectiveLabels[page.objective] || page.objective}</span>
                            <span>•</span>
                            <span>{planLabels[page.plan] || page.plan}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{new Date(page.created_at).toLocaleDateString("pt-BR")}</span>
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
                            onClick={() => navigate(`/admin/editar/${page.id}`)}
                            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(page.id, page.student_name)}
                            className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {pagesToDisplay.length === 0 && !isLoading && !currentFolder && visibleFolders.length === 0 && (
                    <div className="text-center py-16">
                      <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        {pages.length === 0
                          ? "Nenhuma página criada ainda. Clique em \"Nova Página\" para começar!"
                          : "Nenhuma página ou pasta encontrada com os filtros atuais."}
                      </p>
                    </div>
                  )}

                  {pagesToDisplay.length === 0 && currentFolder && (
                    <div className="text-center py-16">
                      <Folder className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">
                        Esta pasta não contém alunos correspondentes aos filtros.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
