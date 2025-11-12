#!/usr/bin/env node

/**
 * Test all external service connections
 */

import * as dotenv from 'dotenv';
import { testConnection } from '../src/lib/db';
import { testRedisConnection } from '../src/lib/redis';

dotenv.config();

async function testConnections() {
  console.log('🔍 Testing Sentinel Service Connections\n');

  let allPassed = true;

  // Test PostgreSQL
  console.log('1️⃣  Testing PostgreSQL connection...');
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      console.log('   ✅ PostgreSQL: Connected\n');
    } else {
      console.log('   ❌ PostgreSQL: Failed\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ PostgreSQL: Error -', error);
    allPassed = false;
  }

  // Test Redis
  console.log('2️⃣  Testing Redis connection...');
  try {
    const redisConnected = await testRedisConnection();
    if (redisConnected) {
      console.log('   ✅ Redis: Connected\n');
    } else {
      console.log('   ❌ Redis: Failed\n');
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Redis: Error -', error);
    allPassed = false;
  }

  // Test Helius API
  console.log('3️⃣  Testing Helius API...');
  if (process.env.HELIUS_API_KEY) {
    console.log('   ✅ Helius API key configured\n');
  } else {
    console.log('   ⚠️  Helius API key not configured\n');
  }

  // Test Solana RPC
  console.log('4️⃣  Testing Solana RPC...');
  if (process.env.SOLANA_RPC_URL) {
    console.log(`   ✅ Solana RPC configured: ${process.env.SOLANA_RPC_URL}\n`);
  } else {
    console.log('   ⚠️  Solana RPC URL not configured\n');
  }

  // Test Switchboard
  console.log('5️⃣  Testing Switchboard configuration...');
  if (process.env.SWITCHBOARD_API_KEY) {
    console.log('   ✅ Switchboard API key configured\n');
  } else {
    console.log('   ⚠️  Switchboard API key not configured\n');
  }

  // Test Telegram Bot
  console.log('6️⃣  Testing Telegram Bot configuration...');
  if (process.env.TELEGRAM_BOT_TOKEN) {
    console.log('   ✅ Telegram bot token configured\n');
  } else {
    console.log('   ⚠️  Telegram bot token not configured\n');
  }

  // Summary
  console.log('━'.repeat(50));
  if (allPassed) {
    console.log('✅ All critical connections successful!');
  } else {
    console.log('❌ Some connections failed. Please check configuration.');
    process.exit(1);
  }

  process.exit(0);
}

testConnections().catch((error) => {
  console.error('❌ Connection test failed:', error);
  process.exit(1);
});
