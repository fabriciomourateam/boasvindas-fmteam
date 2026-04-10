import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Edit2, Copy, Trash2, FileText, LayoutTemplate, LogOut, ArrowLeft, Folder, FolderOutput, Tag, Settings2, X, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useStudentPages, useDeleteStudentPage, useUpdateStudentPage } from "@/hooks/useStudentPages";
import { useRequireAuth } from "@/hooks/useAuth";
import { TagInput } from "@/components/TagInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ old: string, new: string } | null>(null);

  const navigate = useNavigate();
  const { signOut } = useRequireAuth();

  const { data: pages = [], isLoading } = useStudentPages();
  const deleteMutation = useDeleteStudentPage();
  const updateMutation = useUpdateStudentPage();

  const allFolders = Array.from(new Set(pages.map(p => (p.custom_content as any)?.folder).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(pages.flatMap(p => (p.custom_content as any)?.tags || []))).sort() as string[];

  const searchedPages = pages.filter((p) => {
    const matchesSearch = p.student_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "todos" || p.status === filterStatus;

    // Check if page has ALL selected tags (if any)
    const pageTags = (p.custom_content as any)?.tags || [];
    const matchesTags = selectedTags.length === 0 || selectedTags.every(t => pageTags.includes(t));

    return matchesSearch && matchesFilter && matchesTags;
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

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const targetFolder = destination.droppableId;
    const page = pages.find(p => p.id === draggableId);
    if (!page) return;

    const currentPageFolder = (page.custom_content as any)?.folder || null;
    const newFolder = targetFolder === "__sem_pasta__" ? null : targetFolder;

    if (currentPageFolder === newFolder) return;

    const updatedContent = { ...(page.custom_content as any || {}), folder: newFolder };
    if (!newFolder) delete updatedContent.folder;

    try {
      await updateMutation.mutateAsync({
        id: page.id,
        custom_content: updatedContent,
      });
      toast.success(
        newFolder
          ? `${page.student_name} movido para "${newFolder}"`
          : `${page.student_name} removido da pasta`
      );
    } catch {
      toast.error("Erro ao mover aluno.");
    }
  };

  const handleUpdateStudentTags = async (pageId: string, customContent: any, newTags: string[]) => {
    try {
      await updateMutation.mutateAsync({
        id: pageId,
        custom_content: { ...customContent, tags: newTags },
      });
      toast.success("Tags atualizadas!");
    } catch {
      toast.error("Erro ao atualizar tags.");
    }
  };

  const handleRenameGlobalTag = async (oldTag: string, newTag: string) => {
    if (!newTag.trim() || oldTag === newTag) {
      setEditingTag(null);
      return;
    }

    const pagesToUpdate = pages.filter(p => ((p.custom_content as any)?.tags || []).includes(oldTag));

    try {
      await Promise.all(pagesToUpdate.map(p => {
        const cc = p.custom_content as any || {};
        const tags = cc.tags || [];
        const updatedTags = tags.map((t: string) => t === oldTag ? newTag : t);
        return updateMutation.mutateAsync({
          id: p.id,
          custom_content: { ...cc, tags: updatedTags }
        });
      }));
      toast.success("Tag renomeada com sucesso!");
      setEditingTag(null);
    } catch {
      toast.error("Erro ao renomear tag.");
    }
  };

  const handleDeleteGlobalTag = async (tagToDelete: string) => {
    if (!confirm(`Tem certeza que deseja excluir a tag "${tagToDelete}" de TODOS os alunos?`)) return;

    const pagesToUpdate = pages.filter(p => ((p.custom_content as any)?.tags || []).includes(tagToDelete));

    try {
      await Promise.all(pagesToUpdate.map(p => {
        const cc = p.custom_content as any || {};
        const tags = cc.tags || [];
        const updatedTags = tags.filter((t: string) => t !== tagToDelete);
        return updateMutation.mutateAsync({
          id: p.id,
          custom_content: { ...cc, tags: updatedTags }
        });
      }));
      toast.success("Tag excluída com sucesso!");
      if (selectedTags.includes(tagToDelete)) {
        setSelectedTags(selectedTags.filter(t => t !== tagToDelete));
      }
    } catch {
      toast.error("Erro ao excluir tag.");
    }
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
              onClick={() => setIsManageTagsOpen(true)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/20 text-white text-sm hover:bg-white/5 transition-colors"
              title="Gerenciar Tags"
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tags</span>
            </button>
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
            {/* Tag Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-sm font-medium hover:border-gold/50 transition-colors text-foreground">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="hidden sm:inline">Tags</span>
                  {selectedTags.length > 0 && (
                    <span className="bg-gold text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                      {selectedTags.length}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <h4 className="text-sm font-semibold mb-2">Filtrar por Tags</h4>
                <div className="space-y-4">
                  <TagInput
                    value={selectedTags}
                    onChange={setSelectedTags}
                    availableTags={allTags}
                    placeholder="Selecione as tags..."
                  />
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-muted-foreground hover:text-foreground w-full text-left"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
          <DragDropContext onDragEnd={handleDragEnd}>
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

              {/* Folders List (droppable targets) */}
              {!currentFolder && visibleFolders.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pastas</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {visibleFolders.map((folder, i) => {
                      const itemsInFolder = searchedPages.filter(p => (p.custom_content as any)?.folder === folder).length;
                      return (
                        <Droppable key={folder} droppableId={folder}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              <motion.button
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setCurrentFolder(folder)}
                                className={`flex flex-col items-center justify-center p-6 rounded-xl bg-card border transition-all text-center group w-full ${snapshot.isDraggingOver
                                  ? "border-gold shadow-lg shadow-gold/20 scale-105 bg-gold/5"
                                  : "border-border hover:border-gold hover:shadow-gold/10"
                                  }`}
                              >
                                <Folder className={`w-10 h-10 mb-3 transition-transform ${snapshot.isDraggingOver ? "text-gold scale-125" : "text-gold group-hover:scale-110"
                                  }`} />
                                <h3 className="font-semibold text-foreground text-sm truncate w-full">{folder}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{itemsInFolder} {itemsInFolder === 1 ? 'aluno' : 'alunos'}</p>
                                {snapshot.isDraggingOver && (
                                  <p className="text-xs text-gold font-medium mt-2 animate-pulse">Solte aqui</p>
                                )}
                              </motion.button>
                              <div className="hidden">{provided.placeholder}</div>
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Drop zone: remove from folder (shown only when inside a folder) */}
              {currentFolder && (
                <Droppable droppableId="__sem_pasta__">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all ${snapshot.isDraggingOver
                        ? "border-amber-400 bg-amber-400/10 shadow-lg"
                        : "border-border/50 bg-card/50"
                        }`}
                    >
                      <FolderOutput className={`w-5 h-5 transition-colors ${snapshot.isDraggingOver ? "text-amber-400" : "text-muted-foreground/50"
                        }`} />
                      <span className={`text-sm font-medium transition-colors ${snapshot.isDraggingOver ? "text-amber-400 animate-pulse" : "text-muted-foreground/50"
                        }`}>
                        {snapshot.isDraggingOver ? "Solte para remover da pasta" : "Arraste um aluno aqui para remover da pasta"}
                      </span>
                      <div className="hidden">{provided.placeholder}</div>
                    </div>
                  )}
                </Droppable>
              )}

              {/* Pages List (draggable items) */}
              {(pagesToDisplay.length > 0 || !currentFolder) && (
                <div>
                  {!currentFolder && visibleFolders.length > 0 && pagesToDisplay.length > 0 && (
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-6">Alunos sem pasta</h2>
                  )}
                  <Droppable droppableId={currentFolder || "__sem_pasta__"} isDropDisabled={!currentFolder}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3"
                      >
                        {pagesToDisplay.map((page, index) => (
                          <Draggable key={page.id} draggableId={page.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={dragProvided.draggableProps.style}
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className={`p-4 rounded-lg bg-card border transition-colors select-none ${dragSnapshot.isDragging
                                    ? "border-gold shadow-xl shadow-gold/10 rotate-1 opacity-90"
                                    : "border-border hover:border-gold/30"
                                    }`}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground text-sm truncate">{page.student_name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[page.status]}`}>
                                          {statusLabels[page.status]}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span>{objectiveLabels[page.objective] || page.objective}</span>
                                        <span>•</span>
                                        <span>{planLabels[page.plan] || page.plan}</span>
                                        <span className="hidden sm:inline">•</span>
                                        <span className="hidden sm:inline">{new Date(page.created_at).toLocaleDateString("pt-BR")}</span>
                                      </div>

                                      {/* Tags display */}
                                      {((page.custom_content as any)?.tags?.length > 0) && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {(page.custom_content as any).tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                            title="Editar Tags"
                                          >
                                            <Tag className="w-4 h-4" />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-3 z-50 pointer-events-auto" align="end" side="left">
                                          <div className="space-y-3">
                                            <h4 className="text-sm font-semibold">Tags do Aluno</h4>
                                            <TagInput
                                              value={(page.custom_content as any)?.tags || []}
                                              onChange={(newTags) => handleUpdateStudentTags(page.id, page.custom_content, newTags)}
                                              availableTags={allTags}
                                              placeholder="Adicionar tag..."
                                            />
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                      <button
                                        onClick={() => navigate(`/aluno/${page.slug}`)}
                                        className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                        title="Visualizar"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const url = `${window.location.origin}/aluno/${page.slug}`;
                                          navigator.clipboard.writeText(url);
                                          toast.success("Link copiado!");
                                          window.open(url, '_blank');
                                        }}
                                        className="p-2 rounded-md hover:bg-[#25D366]/10 transition-colors text-muted-foreground hover:text-[#25D366]"
                                        title="Abrir página e copiar link"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                                      </button>
                                      <button
                                        onClick={() => copyLink(page.slug)}
                                        className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                        title="Copiar link"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (page.notes) {
                                            navigator.clipboard.writeText(page.notes);
                                            toast.success("Texto de envio copiado!");
                                          } else {
                                            toast.error("Este aluno não possui um texto de envio definido.");
                                          }
                                        }}
                                        className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                        title="Copiar texto de envio"
                                      >
                                        <MessageSquare className="w-4 h-4" />
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
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

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
                    )}
                  </Droppable>
                </div>
              )}
            </div>
          </DragDropContext>
        )}
      </main>

      {/* Gerenciar Tags Global Modal */}
      <Dialog open={isManageTagsOpen} onOpenChange={setIsManageTagsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gerenciar Tags Globais</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Edite ou exclua tags de todos os alunos simultaneamente.
            </p>
            {allTags.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 bg-secondary/20 rounded-lg">
                Nenhuma tag criada ainda.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {allTags.map(tag => (
                  <div key={tag} className="flex items-center justify-between p-2 rounded-md border bg-card">
                    {editingTag?.old === tag ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingTag.new}
                          onChange={(e) => setEditingTag({ ...editingTag, new: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameGlobalTag(tag, editingTag.new);
                            if (e.key === "Escape") setEditingTag(null);
                          }}
                          className="flex-1 px-2 py-1 text-sm border rounded bg-background"
                        />
                        <button
                          onClick={() => handleRenameGlobalTag(tag, editingTag.new)}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingTag(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{tag}</span>
                          <span className="text-xs text-muted-foreground">
                            ({pages.filter(p => ((p.custom_content as any)?.tags || []).includes(tag)).length})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTag({ old: tag, new: tag })}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
                            title="Renomear"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGlobalTag(tag)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                            title="Excluir de todos"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
