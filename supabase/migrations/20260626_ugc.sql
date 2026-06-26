-- UGC: fotos de uso em sala de aula enviadas por professores
CREATE TABLE IF NOT EXISTS public.ugc_photos (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID        REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT        NOT NULL,
  caption     TEXT,
  approved    BOOLEAN     DEFAULT FALSE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.ugc_photos ENABLE ROW LEVEL SECURITY;

-- Usuários gerenciam as próprias fotos
CREATE POLICY "Users manage own ugc" ON public.ugc_photos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Público lê apenas fotos aprovadas
CREATE POLICY "Public read approved ugc" ON public.ugc_photos
  FOR SELECT
  USING (approved = TRUE);

CREATE INDEX IF NOT EXISTS ugc_photos_activity_id_idx ON public.ugc_photos(activity_id);
CREATE INDEX IF NOT EXISTS ugc_photos_user_id_idx ON public.ugc_photos(user_id);
CREATE INDEX IF NOT EXISTS ugc_photos_approved_idx ON public.ugc_photos(approved) WHERE approved = TRUE;
