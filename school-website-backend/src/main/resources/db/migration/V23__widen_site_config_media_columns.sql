-- Logos/favicons are stored inline as Base64 data URIs, and social_links holds the
-- banner + admissions-promo JSON (including media/video URLs). These easily exceed the
-- original VARCHAR limits. Postgres strictly rejects overflow (H2 tolerated it), causing
-- a 500 on config save. Widen them to TEXT.
ALTER TABLE site_configs ALTER COLUMN logo_url TYPE TEXT;
ALTER TABLE site_configs ALTER COLUMN favicon_url TYPE TEXT;
ALTER TABLE site_configs ALTER COLUMN social_links TYPE TEXT;
