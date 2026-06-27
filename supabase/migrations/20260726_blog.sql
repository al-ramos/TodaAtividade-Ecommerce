CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL CHECK (char_length(excerpt) <= 300),
  content text NOT NULL,
  cover_image_url text,
  author_name text NOT NULL DEFAULT 'Equipe TodaAtividade',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles (slug);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at DESC NULLS LAST);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Articles public read" ON articles FOR SELECT USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Service role full access" ON articles USING (true) WITH CHECK (true);
