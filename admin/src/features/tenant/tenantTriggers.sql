CREATE OR REPLACE FUNCTION tenant_log() RETURNS trigger AS $body$
DECLARE
    current_user_id uuid;
    current_api_key_id uuid;
BEGIN
    if (current_setting('app.current_user_id', 't') != '') then
        current_user_id := (current_setting('app.current_user_id', 't')::uuid);
    else
        current_user_id  := null;
    end if;

    if (current_setting('app.current_api_key_id', 't') != '') then
        current_api_key_id := (current_setting('app.current_api_key_id', 't')::uuid);
    else
        current_api_key_id := null;
    end if;

    if (TG_OP = 'UPDATE') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "tenantId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'Tenant', OLD.id, current_user_id, OLD.id, current_api_key_id, 'U', to_jsonb(OLD), to_jsonb(NEW), txid_current() );
        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "tenantId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'Tenant', OLD.id, current_user_id, OLD.id, current_api_key_id, 'D', to_jsonb(OLD), null, txid_current() );
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "tenantId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'Tenant', NEW.id, current_user_id, NEW.id, current_api_key_id, 'C', null, to_jsonb(NEW), txid_current() );
        RETURN NEW;
    else
        RETURN NULL;
    end if;
END;
$body$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_log_trigger on "Tenant";
CREATE TRIGGER tenant_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON "Tenant"
FOR EACH ROW EXECUTE FUNCTION tenant_log();
