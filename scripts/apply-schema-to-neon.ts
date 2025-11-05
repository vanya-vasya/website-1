import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const CONNECTION_STRING = 'postgresql://neondb_owner:npg_dzXc8nBCA5ea@ep-orange-thunder-ah30fcyx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function applySchema() {
  const pool = new Pool({
    connectionString: CONNECTION_STRING,
  });

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...\n');
    
    const client = await pool.connect();
    console.log('✅ Connected successfully!\n');

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log('📄 Applying schema from: db/schema.sql\n');
    console.log('⚙️  Executing SQL statements...\n');

    // Execute the schema
    await client.query(schemaSql);

    console.log('✅ Schema applied successfully!\n');

    // Verify tables created
    console.log('🔍 Verifying tables...\n');
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log('📋 Tables created:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    console.log('\n🔍 Verifying User table schema...\n');
    const userSchemaResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `);

    console.log('User table columns:');
    userSchemaResult.rows.forEach((col) => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`   ├─ ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });

    console.log('\n🔍 Verifying Transaction table schema...\n');
    const transactionSchemaResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'Transaction'
      ORDER BY ordinal_position
    `);

    console.log('Transaction table columns:');
    transactionSchemaResult.rows.forEach((col) => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`   ├─ ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });

    console.log('\n🔍 Verifying indexes...\n');
    const indexesResult = await client.query(`
      SELECT 
        indexname,
        tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('User', 'Transaction', 'WebhookEvent')
      ORDER BY tablename, indexname
    `);

    console.log('Indexes created:');
    indexesResult.rows.forEach((idx) => {
      console.log(`   ├─ ${idx.indexname} on ${idx.tablename}`);
    });

    console.log('\n🔍 Verifying triggers...\n');
    const triggersResult = await client.query(`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `);

    if (triggersResult.rows.length > 0) {
      console.log('Triggers created:');
      triggersResult.rows.forEach((trigger) => {
        console.log(`   ├─ ${trigger.trigger_name} on ${trigger.event_object_table} (${trigger.event_manipulation})`);
      });
    } else {
      console.log('No triggers found');
    }

    client.release();
    console.log('\n✨ Schema setup complete!\n');
    console.log('🎯 Your Neon database is ready to use.\n');

  } catch (error) {
    console.error('❌ Error applying schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
applySchema()
  .then(() => {
    console.log('👍 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

