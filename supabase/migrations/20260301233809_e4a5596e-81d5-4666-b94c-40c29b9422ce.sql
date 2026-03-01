
-- Enum for objectives
CREATE TYPE public.student_objective AS ENUM ('emagrecimento', 'recomposicao', 'hipertrofia');

-- Enum for page status
CREATE TYPE public.page_status AS ENUM ('rascunho', 'revisado', 'enviado', 'inativo');

-- Enum for plan type
CREATE TYPE public.plan_type AS ENUM ('shape', 'premium', 'premium_anual');

-- Team profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  objective student_objective NOT NULL,
  blocks JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read templates" ON public.templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert templates" ON public.templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update templates" ON public.templates FOR UPDATE TO authenticated USING (true);

-- Student pages table
CREATE TABLE public.student_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,
  objective student_objective NOT NULL,
  plan plan_type NOT NULL DEFAULT 'shape',
  status page_status NOT NULL DEFAULT 'rascunho',
  
  -- Template reference
  template_id UUID REFERENCES public.templates(id),
  
  -- Toggle blocks
  has_treino BOOLEAN NOT NULL DEFAULT false,
  has_psicologa BOOLEAN NOT NULL DEFAULT false,
  has_bioimpedancia BOOLEAN NOT NULL DEFAULT false,
  has_area_membros BOOLEAN NOT NULL DEFAULT true,
  has_apps BOOLEAN NOT NULL DEFAULT true,
  
  -- Links
  members_link TEXT,
  support_link TEXT,
  
  -- Credentials
  webdiet_login TEXT,
  webdiet_password TEXT,
  mfit_login TEXT,
  mfit_password TEXT,
  
  -- Content
  strategy TEXT,
  duration TEXT,
  notes TEXT,
  custom_content JSONB DEFAULT '{}',
  
  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.student_pages ENABLE ROW LEVEL SECURITY;

-- Authenticated team members can CRUD
CREATE POLICY "Authenticated can read student pages" ON public.student_pages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert student pages" ON public.student_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update student pages" ON public.student_pages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete student pages" ON public.student_pages FOR DELETE TO authenticated USING (true);

-- Public can read active pages by slug (for the student-facing page)
CREATE POLICY "Public can read sent pages" ON public.student_pages FOR SELECT TO anon USING (status = 'enviado');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_student_pages_updated_at
  BEFORE UPDATE ON public.student_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
