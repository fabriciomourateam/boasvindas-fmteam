-- Corrige o erro ao excluir templates.
--
-- Problema 1: a tabela `templates` tem RLS habilitado mas só possui policies de
-- SELECT/INSERT/UPDATE. Sem uma policy de DELETE, qualquer DELETE é bloqueado
-- (não exclui nada / retorna erro de permissão).
--
-- Problema 2: `student_pages.template_id` referencia `templates(id)` sem regra
-- ON DELETE, então excluir um template usado por alguma página viola a foreign key.

-- 1) Permitir que usuários autenticados excluam templates
CREATE POLICY "Authenticated users can delete templates"
  ON public.templates
  FOR DELETE
  TO authenticated
  USING (true);

-- 2) Ao excluir um template, manter as páginas e apenas limpar a referência
ALTER TABLE public.student_pages
  DROP CONSTRAINT IF EXISTS student_pages_template_id_fkey;

ALTER TABLE public.student_pages
  ADD CONSTRAINT student_pages_template_id_fkey
    FOREIGN KEY (template_id)
    REFERENCES public.templates(id)
    ON DELETE SET NULL;
