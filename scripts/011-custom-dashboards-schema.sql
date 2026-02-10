-- Custom dashboards for analytics builder
CREATE TABLE IF NOT EXISTS custom_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  widgets jsonb NOT NULL DEFAULT '[]'::jsonb,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean NOT NULL DEFAULT false,
  shared_with jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_dashboards_owner_id ON custom_dashboards(owner_id);
CREATE INDEX IF NOT EXISTS idx_custom_dashboards_shared_with ON custom_dashboards USING gin(shared_with);
