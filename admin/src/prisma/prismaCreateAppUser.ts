const { Client: PgClient } = require('pg');
const parse = require('pg-connection-string').parse;

export async function prismaCreateAppUser() {
  if (
    !process.env.DATABASE_MIGRATION_URL ||
    !process.env.DATABASE_APP_USER ||
    !process.env.DATABASE_APP_PASSWORD ||
    !process.env.DATABASE_NAME ||
    !process.env.DATABASE_SCHEMA
  ) {
    throw new Error(
      'DATABASE_MIGRATION_URL, DATABASE_APP_USER, DATABASE_APP_PASSWORD, DATABASE_NAME, and DATABASE_SCHEMA must be set in .env',
    );
  }

  console.log(`Creating or updating database user ${process.env.DATABASE_APP_USER}...`);

  const sql = `
    SET search_path TO "${process.env.DATABASE_SCHEMA}";

    DO
      $do$
      BEGIN
        IF EXISTS (
            SELECT FROM pg_catalog.pg_roles
            WHERE  rolname = '${process.env.DATABASE_APP_USER}') THEN

            RAISE NOTICE 'Role "${process.env.DATABASE_APP_USER}" already exists. Skipping.';
        ELSE
            CREATE ROLE "${process.env.DATABASE_APP_USER}" LOGIN PASSWORD '${process.env.DATABASE_APP_PASSWORD}';
        END IF;
      END
      $do$;

    GRANT CREATE ON DATABASE "${process.env.DATABASE_NAME}" TO "${process.env.DATABASE_APP_USER}";

    GRANT CREATE, USAGE ON SCHEMA "${process.env.DATABASE_SCHEMA}" TO "${process.env.DATABASE_APP_USER}";

    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA "${process.env.DATABASE_SCHEMA}" TO "${process.env.DATABASE_APP_USER}";
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA "${process.env.DATABASE_SCHEMA}" TO "${process.env.DATABASE_APP_USER}";
    GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA "${process.env.DATABASE_SCHEMA}" TO "${process.env.DATABASE_APP_USER}";
  `;

  const database = new PgClient(parse(process.env.DATABASE_MIGRATION_URL));

  await database.connect();

  try {
    await database.query(sql);
  } catch (error) {
    console.error(error);
    // ignore error because user might already be created
  }

  database.end();
}
