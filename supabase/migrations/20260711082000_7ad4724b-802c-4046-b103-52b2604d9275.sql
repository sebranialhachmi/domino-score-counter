-- Base tables for CMS pages, blog posts and FAQs.
-- In the original Lovable project these three tables were created outside the
-- migration history, so later migrations (seed data, ALTER ... ADD COLUMN,
-- triggers) failed on a fresh database. This creates them with only their
-- original columns; the columns added later stay in the later migrations.
-- Everything is idempotent so it is a no-op on a database that already has them.

DO $$ BEGIN
  CREATE TYPE public.cms_page_type AS ENUM ('generic','service','airport','city','route_page','category');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ CMS PAGES ============
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  page_type public.cms_page_type NOT NULL DEFAULT 'generic',
  title_ar text NOT NULL,
  title_en text NOT NULL,
  subtitle_ar text,
  subtitle_en text,
  body_ar text,
  body_en text,
  hero_image_url text,
  og_image_url text,
  meta_title text,
  meta_description text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cms_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_pages TO authenticated;
GRANT ALL ON public.cms_pages TO service_role;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cms_pages public read" ON public.cms_pages;
CREATE POLICY "cms_pages public read" ON public.cms_pages FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "cms_pages staff read all" ON public.cms_pages;
CREATE POLICY "cms_pages staff read all" ON public.cms_pages FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "cms_pages staff write" ON public.cms_pages;
CREATE POLICY "cms_pages staff write" ON public.cms_pages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
DROP TRIGGER IF EXISTS cms_pages_updated ON public.cms_pages;
CREATE TRIGGER cms_pages_updated BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BLOG POSTS ============
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  excerpt_ar text,
  excerpt_en text,
  content_ar text,
  content_en text,
  cover_url text,
  meta_title text,
  meta_description text,
  tags text[],
  author_id uuid, -- no FK: lets blog content be imported from another project
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "blog_posts public read" ON public.blog_posts;
CREATE POLICY "blog_posts public read" ON public.blog_posts FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "blog_posts staff read all" ON public.blog_posts;
CREATE POLICY "blog_posts staff read all" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "blog_posts staff write" ON public.blog_posts;
CREATE POLICY "blog_posts staff write" ON public.blog_posts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
DROP TRIGGER IF EXISTS blog_posts_updated ON public.blog_posts;
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FAQS ============
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar text NOT NULL,
  question_en text NOT NULL,
  answer_ar text NOT NULL,
  answer_en text NOT NULL,
  category text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faqs public read" ON public.faqs;
CREATE POLICY "faqs public read" ON public.faqs FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "faqs staff read all" ON public.faqs;
CREATE POLICY "faqs staff read all" ON public.faqs FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "faqs staff write" ON public.faqs;
CREATE POLICY "faqs staff write" ON public.faqs FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
DROP TRIGGER IF EXISTS faqs_updated ON public.faqs;
CREATE TRIGGER faqs_updated BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
