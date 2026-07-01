import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Template = Tables<"templates">;
type TemplateInsert = TablesInsert<"templates">;
type TemplateUpdate = TablesUpdate<"templates">;

/** Shape of the content JSONB column */
export interface TemplateContent {
    strategy?: string;
    duration?: string;
    steps?: Array<{ title: string; description: string }>;
    guidelines?: {
        title?: string;
        hideHighlightsTitle?: boolean;
        content: string;
        highlights: Array<string | { title: string; content: string; hidden?: boolean }>;
    };
    faqs?: Array<{ question: string; answer: string }>;
    links?: Array<{
        label: string;
        url: string;
        icon?: string;
        description?: string;
    }>;
    credentials?: {
        webdietLogin?: string;
        webdietPassword?: string;
        mfitLogin?: string;
        mfitPassword?: string;
    };
    membersLink?: string;
    supportHours?: string;
    whatsappUrl?: string;
    notes?: string;
    sectionOrder?: string[];
    stepsTitle?: string;
    hideStepsTitle?: boolean;
    collapsedSteps?: Record<number, boolean>;
    collapsedHighlights?: Record<number, boolean>;
    collapsedOptionalBlocks?: Record<number, boolean>;
    standardBlocks?: any;
    standardBlocksOrder?: any;
    extrasImageUrl?: string;
    video?: { url?: string; buttonLabel?: string; buttonUrl?: string };
    editorCollapse?: Record<string, boolean>;
    standardBlocksOpen?: string[] | null;
    /** Soft-delete: template arquivado fica oculto da lista principal. */
    archived?: boolean;
}

export interface TemplateBlocks {
    hasTreino?: boolean;
    hasPsicologa?: boolean;
    hasBioimpedancia?: boolean;
    hasAreaMembros?: boolean;
    hasApps?: boolean;
    optionalBlocks?: Array<{
        type: "treino" | "psicologa" | "bioimpedancia" | "area_membros" | "apps" | "extras" | "imagem";
        title: string;
        content: string;
        link?: string;
        linkLabel?: string;
        link2?: string;
        linkLabel2?: string;
        imageUrl?: string;
    }>;
    customBlocks?: Array<{
        type: string;
        title: string;
        content: string;
        link?: string;
        linkLabel?: string;
        link2?: string;
        linkLabel2?: string;
        imageUrl?: string;
    }>;
}

export function useTemplates(objective?: string) {
    return useQuery({
        queryKey: ["templates", objective],
        queryFn: async () => {
            let query = supabase
                .from("templates")
                .select("*")
                .order("created_at", { ascending: false });

            if (objective) {
                query = query.eq("objective", objective as any);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Template[];
        },
    });
}

export function useTemplate(id: string) {
    return useQuery({
        queryKey: ["template", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("templates")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Template;
        },
        enabled: !!id,
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (template: TemplateInsert) => {
            const { data, error } = await supabase
                .from("templates")
                .insert(template)
                .select()
                .single();

            if (error) throw error;
            return data as Template;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
}

export function useUpdateTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: TemplateUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from("templates")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data as Template;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
}

export function useArchiveTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, content, archived }: { id: string; content: any; archived: boolean }) => {
            const newContent = { ...(content || {}), archived };
            const { data, error } = await supabase
                .from("templates")
                .update({ content: newContent })
                .eq("id", id)
                .select("id");

            if (error) throw error;
            if (!data || data.length === 0) {
                throw new Error(
                    "Não foi possível arquivar o template (permissão negada). Verifique a policy de UPDATE da tabela templates no Supabase."
                );
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await supabase
                .from("templates")
                .delete()
                .eq("id", id)
                .select("id");

            if (error) throw error;
            // Sem erro mas nenhuma linha removida = bloqueado por RLS (falta policy de DELETE)
            if (!data || data.length === 0) {
                throw new Error(
                    "Não foi possível excluir o template (permissão negada). Verifique a policy de DELETE da tabela templates no Supabase."
                );
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
}
