CREATE OR REPLACE FUNCTION user_log() RETURNS trigger AS $body$
DECLARE
    current_user_id uuid;
    current_api_key_id uuid;
    old_safe JSONB := null;
    new_safe JSONB = null;
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

    new_safe := to_jsonb(NEW);
    new_safe := jsonb_set(new_safe, '{password}', '"ommited"'::jsonb);
    new_safe := jsonb_set(new_safe, '{passwordResetToken}', '"ommited"'::jsonb);
    new_safe := jsonb_set(new_safe, '{verifyEmailToken}', '"ommited"'::jsonb);

    old_safe := to_jsonb(OLD);
    old_safe := jsonb_set(old_safe, '{password}', '"ommited"'::jsonb);
    old_safe := jsonb_set(old_safe, '{passwordResetToken}', '"ommited"'::jsonb);
    old_safe := jsonb_set(old_safe, '{verifyEmailToken}', '"ommited"'::jsonb);

    if (TG_OP = 'UPDATE') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'User', OLD.id, current_user_id, current_api_key_id, 'U', old_safe, new_safe, txid_current() );
        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'User', OLD.id, current_user_id, current_api_key_id, 'D', old_safe, null, txid_current() );
        RETURN OLD;
    elsif (TG_OP = 'INSERT') then
        INSERT INTO "AuditLog" ( id, "entityName", "entityId", "userId", "apiKeyId", operation, "oldData", "newData", "transactionId" ) values ( gen_random_uuid(), 'User', NEW.id, current_user_id, current_api_key_id, 'C', null, new_safe, txid_current() );
        RETURN NEW;
    else
        RETURN NULL;
    end if;
END;
$body$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_log_trigger on "User";
CREATE TRIGGER user_log_trigger
AFTER INSERT OR UPDATE OR DELETE ON "User"
FOR EACH ROW EXECUTE FUNCTION user_log();
