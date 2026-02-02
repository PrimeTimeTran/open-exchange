-- Enable Row Level Security
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "Membership" FORCE ROW LEVEL SECURITY;

-- Create row security policies
DO
  $do$
  BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies WHERE  policyname = 'tenant_isolation_policy' AND tablename = 'Membership' and schemaname = current_schema()
    ) THEN
      CREATE POLICY tenant_isolation_policy ON "Membership" USING ("tenantId"::text = current_setting('app.current_tenant_id', TRUE));
    END IF;
  END
  $do$;

-- Create policies to bypass RLS
DO
  $do$
  BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_policies WHERE policyname = 'bypass_rls_policy'  AND tablename = 'Membership' and schemaname = current_schema()
    ) THEN
      CREATE POLICY bypass_rls_policy ON "Membership" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
    END IF;
  END
  $do$;

CREATE OR REPLACE FUNCTION update_membership_status() RETURNS trigger AS $body$
BEGIN
    IF NEW."roles" IS NULL OR ARRAY_LENGTH(NEW."roles", 1) IS NULL THEN
        NEW."status" = 'disabled';
    ELSIF NEW."invitationToken" IS NOT NULL THEN
        NEW."status" = 'invited';
    ELSE
        NEW."status" = 'active';
    END IF;

    RETURN NEW;
END;
$body$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_membership_status_trigger on "Membership";
CREATE TRIGGER update_membership_status_trigger
BEFORE INSERT OR UPDATE ON "Membership"
FOR EACH ROW
EXECUTE FUNCTION update_membership_status();

CREATE OR REPLACE FUNCTION membership_log() RETURNS trigger AS $body$
DECLARE
    current_user_id uuid;
    current_membership_id uuid;
    current_tenant_id uuid;
    current_api_key_id uuid;
BEGIN
    if (current_setting('app.current_user_id', 't') != '') then
        current_user_id := (current_setting('app.current_user_id', 't')::uuid);
    else
        current_user_id  := null;
    end if;

    if (current_setting('app.current_membership_id', 't') != '') then
        current_membership_id := (current_setting('app.current_membership_id', 't')::uuid);
    end if;

    if (current_setting('app.current_tenant_id', 't') != '') then
        current_tenant_id := (current_setting('app.current_tenant_id', 't')::uuid);
    else
        current_tenant_id := null;
    end if;

    if (current_setting('app.current_api_key_id', 't') != '') then
        current_api_key_id := (current_setting('app.current_api_key_id', 't')::uuid);
    else
        current_api_key_id := null;
    end if;

    if (TG_OP = 'UPDATE') then
        if (current_tenant_id is null) then
            current_tenant_id := OLD."tenantId";
        end if;

        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "membershipId", "tenantId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'Membership', OLD.id, current_user_id, current_membership_id, current_tenant_id, current_api_key_id, 'U', to_jsonb(OLD), to_jsonb(NEW), txid_current() );
        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "membershipId", "tenantId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'Membership', OLD.id, current_user_id, current_membership_id, current_tenant_id, current_api_key_id, 'D', to_jsonb(OLD), null, txid_current() );
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        if (current_user_id is null) then
            current_user_id := NEW."userId";
        end if;

        if (current_membership_id is null) then
            current_membership_id := NEW.id;
        end if;

        if (current_tenant_id is null) then
            current_tenant_id := NEW."tenantId";
        end if;

        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "membershipId", "tenantId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'Membership', NEW.id, current_user_id, current_membership_id, current_tenant_id, current_api_key_id, 'C', null, to_jsonb(NEW), txid_current() );
        RETURN NEW;
    else
        RAISE WARNING '[membership_log] - Other action occurred: %, at %',TG_OP,now();
        RETURN NULL;
    end if;
END;
$body$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS membership_log_trigger on "Membership";
CREATE TRIGGER membership_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Membership"
FOR EACH ROW EXECUTE FUNCTION membership_log();
