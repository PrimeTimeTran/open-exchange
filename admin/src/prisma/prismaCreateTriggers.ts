const { triggers } = require('src/features/triggers');
const { Client: PgClient } = require('pg');
const parse = require('pg-connection-string').parse;

export async function prismaCreateTriggers() {
  if (!process.env.DATABASE_MIGRATION_URL) {
    throw new Error('DATABASE_MIGRATION_URL must be set in .env');
  }

  console.log(`Creating or updating triggers...`);

  let sql = triggers;
  const database = new PgClient(parse(process.env.DATABASE_MIGRATION_URL));
  await database.connect();
  sql = `SET search_path TO "${process.env.DATABASE_SCHEMA}";
  ${sql}`;
  await database.query(sql);
  database.end();
}
