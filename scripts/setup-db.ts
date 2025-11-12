#!/usr/bin/env node

/**
 * Database setup script
 * This script helps set up the PostgreSQL database for the Sentinel x402 integration
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupDatabase() {
  console.log('🚀 Solana Sentinel Database Setup\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\nPlease set DATABASE_URL in your .env file:');
    console.log('DATABASE_URL=postgresql://user:password@localhost:5432/sentinel\n');
    process.exit(1);
  }

  console.log('📋 Database Configuration:');
  console.log(`   URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

  const answer = await question('Do you want to proceed with database setup? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('❌ Setup cancelled');
    rl.close();
    process.exit(0);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('\n🔄 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, version() as version');
    console.log('✅ Connected to database');
    console.log(`   Time: ${result.rows[0].now}`);
    console.log(`   Version: ${result.rows[0].version.split(',')[0]}\n`);
    client.release();

    console.log('✅ Database connection successful!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run migrations: npm run db:migrate');
    console.log('   2. (Optional) Seed test data: npm run db:seed');
    console.log('   3. Start the application: npm run dev\n');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check your DATABASE_URL in .env file');
    console.log('   3. Verify database credentials and permissions');
    console.log('   4. Ensure the database exists (create it if needed)\n');
    process.exit(1);
  } finally {
    await pool.end();
    rl.close();
  }
}

setupDatabase();
