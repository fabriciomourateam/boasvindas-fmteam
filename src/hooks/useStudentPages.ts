import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type StudentPage = Tables<"student_pages">;
type StudentPageInsert = TablesInsert<"student_pages">;
type StudentPageUpdate = TablesUpdate<"student_pages">;

export function useStudentPages(statusFilter?: string) {
    return useQuery({
        queryKey: ["student_pages", statusFilter],
        queryFn: async () => {
            let query = supabase
                .from("student_pages")
                .select("*")
                .order("created_at", { ascending: false });

            if (statusFilter && statusFilter !== "todos") {
                query = query.eq("status", statusFilter as any);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as StudentPage[];
        },
    });
}

export function useStudentPage(slug: string) {
    return useQuery({
        queryKey: ["student_page", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("student_pages")
                .select("*")
                .eq("slug", slug)
                .maybeSingle();

            if (error) throw error;
            return data as StudentPage | null;
        },
        enabled: !!slug,
    });
}

export function useStudentPageById(id: string) {
    return useQuery({
        queryKey: ["student_page_by_id", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("student_pages")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as StudentPage;
        },
        enabled: !!id,
    });
}

export function useCreateStudentPage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (page: StudentPageInsert) => {
            const { data, error } = await supabase
                .from("student_pages")
                .insert(page)
                .select()
                .single();

            if (error) throw error;
            return data as StudentPage;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student_pages"] });
        },
    });
}

export function useUpdateStudentPage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            ...updates
        }: StudentPageUpdate & { id: string }) => {
            const { data, error } = await supabase
                .from("student_pages")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data as StudentPage;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student_pages"] });
        },
    });
}

export function useDeleteStudentPage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("student_pages")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["student_pages"] });
        },
    });
}

/** Generate a slug from a student name */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}
