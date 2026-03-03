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
        content: string;
        highlights: string[];
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
    supportHours?: string;
    whatsappUrl?: string;
    notes?: string;
    sectionOrder?: string[];
    stepsTitle?: string;
    hideStepsTitle?: boolean;
    collapsedSteps?: Record<number, boolean>;
    collapsedHighlights?: Record<number, boolean>;
    collapsedOptionalBlocks?: Record<number, boolean>;
}

export interface TemplateBlocks {
    hasTreino?: boolean;
    hasPsicologa?: boolean;
    hasBioimpedancia?: boolean;
    hasAreaMembros?: boolean;
    hasApps?: boolean;
    optionalBlocks?: Array<{
        type: "treino" | "psicologa" | "bioimpedancia" | "area_membros" | "apps" | "extras";
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

export function useDeleteTemplate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("templates")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
        },
    });
}
