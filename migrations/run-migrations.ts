import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config();

interface Migration {
  filename: string;
  sql: string;
}

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Connecting to database...');
    const client = await pool.connect();
    
    console.log('✅ Connected to database');

    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Get list of applied migrations
    const appliedResult = await client.query(
      'SELECT filename FROM schema_migrations ORDER BY filename'
    );
    const appliedMigrations = new Set(appliedResult.rows.map(row => row.filename));

    // Read migration files
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const migrations: Migration[] = files.map(filename => ({
      filename,
      sql: fs.readFileSync(path.join(migrationsDir, filename), 'utf-8'),
    }));

    console.log(`📋 Found ${migrations.length} migration file(s)`);
    console.log(`✓ Already applied: ${appliedMigrations.size}`);

    // Apply pending migrations
    let appliedCount = 0;
    for (const migration of migrations) {
      if (appliedMigrations.has(migration.filename)) {
        console.log(`⏭️  Skipping ${migration.filename} (already applied)`);
        continue;
      }

      console.log(`🔄 Applying ${migration.filename}...`);
      
      try {
        await client.query('BEGIN');
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [migration.filename]
        );
        await client.query('COMMIT');
        
        console.log(`✅ Applied ${migration.filename}`);
        appliedCount++;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed to apply ${migration.filename}:`, error);
        throw error;
      }
    }

    client.release();

    if (appliedCount === 0) {
      console.log('✨ Database is up to date');
    } else {
      console.log(`✨ Successfully applied ${appliedCount} migration(s)`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();
