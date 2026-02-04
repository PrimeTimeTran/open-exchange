-- Enable Row Level Security
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

-- Create row security policies
DO
  $do$
  BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies WHERE  policyname = 'tenant_isolation_policy' AND tablename = 'AuditLog' and schemaname = current_schema()
    ) THEN
      CREATE POLICY tenant_isolation_policy ON "AuditLog" USING ("tenantId"::text = current_setting('app.current_tenant_id', TRUE));
    END IF;
  END
  $do$;

-- Create policies to bypass RLS
DO
  $do$
  BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies WHERE policyname = 'bypass_rls_policy'  AND tablename = 'AuditLog' and schemaname = current_schema()
    ) THEN
      CREATE POLICY bypass_rls_policy ON "AuditLog" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
    END IF;
  END
  $do$;
