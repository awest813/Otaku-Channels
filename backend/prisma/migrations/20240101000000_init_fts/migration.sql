-- Add full-text search vector column and GIN index to anime_titles
-- This migration is applied after the base schema is in place.
-- Prisma does not natively manage tsvector, so we handle it here with raw SQL.

-- 1. Add the generated tsvector column (computed from titles + synopsis + aliases)
ALTER TABLE anime_titles
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce("titleEnglish", '')), 'A') ||
    setweight(to_tsvector('english', coalesce("titleJapanese", '')), 'B') ||
    setweight(to_tsvector('english', coalesce(synopsis, '')), 'C')
  ) STORED;

-- 2. GIN index for fast full-text lookups
CREATE INDEX IF NOT EXISTS anime_titles_search_vector_idx
  ON anime_titles USING GIN (search_vector);

-- 3. Trigram index on title for prefix/fuzzy matching (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS anime_titles_title_trgm_idx
  ON anime_titles USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS anime_titles_title_english_trgm_idx
  ON anime_titles USING GIN ("titleEnglish" gin_trgm_ops);

-- 4. Trigram index on anime_aliases for alias search
CREATE INDEX IF NOT EXISTS anime_aliases_alias_trgm_idx
  ON anime_aliases USING GIN (alias gin_trgm_ops);
