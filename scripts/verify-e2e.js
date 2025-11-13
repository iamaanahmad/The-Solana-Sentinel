#!/usr/bin/env node

/**
 * Simple E2E Test Runner
 * Verifies basic setup without requiring heavy dependencies
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, text) {
  console.log(`${color}${text}${colors.reset}`);
}

function pass(name, msg) {
  log(colors.green, `✅ ${name}: ${msg}`);
}

function fail(name, msg) {
  log(colors.red, `❌ ${name}: ${msg}`);
  process.exit(1);
}

function warn(name, msg) {
  log(colors.yellow, `⚠️  ${name}: ${msg}`);
}

function skip(name, msg) {
  log(colors.cyan, `⏭️  ${name}: ${msg}`);
}

async function runCommand(cmd, args) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { shell: true, stdio: 'pipe' });
    let output = '';
    let error = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      error += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, output, error });
    });
  });
}

async function main() {
  log(colors.blue, '\n🔍 E2E Test Environment Verification\n');

  // Check .env.local
  log(colors.blue, '📋 Test 1: Environment File');
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) {
    fail('Environment', '.env.local not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const programIdMatch = envContent.match(/NEXT_PUBLIC_PROGRAM_ID=([A-Za-z0-9]{44})/);
  const rpcMatch = envContent.match(/NEXT_PUBLIC_SOLANA_RPC_URL=(.+?)(?:\n|$)/);

  if (!programIdMatch) fail('Program ID', 'NEXT_PUBLIC_PROGRAM_ID not found in .env.local');
  if (!rpcMatch) fail('RPC URL', 'NEXT_PUBLIC_SOLANA_RPC_URL not found in .env.local');

  const PROGRAM_ID = programIdMatch[1];
  const RPC_URL = rpcMatch[1].trim();

  pass('Environment File', `.env.local found with Program ID: ${PROGRAM_ID.substring(0, 8)}...`);

  // Check Node modules
  log(colors.blue, '\n📋 Test 2: Dependencies');
  const nodeModules = path.resolve('node_modules');
  if (!fs.existsSync(nodeModules)) {
    fail('Dependencies', 'node_modules not found. Run: npm install');
  }
  pass('Dependencies', 'node_modules present');

  // Check Web3 Client
  log(colors.blue, '\n📋 Test 3: Web3 Client');
  const web3Path = path.resolve('src/lib/web3-client.ts');
  if (!fs.existsSync(web3Path)) {
    fail('Web3 Client', 'web3-client.ts not found');
  }
  pass('Web3 Client', 'web3-client.ts exists');

  // Check Phantom Wallet Components
  log(colors.blue, '\n📋 Test 4: Wallet Components');
  const walletPath = path.resolve('src/components/web3-wallet.tsx');
  if (!fs.existsSync(walletPath)) {
    fail('Wallet Components', 'web3-wallet.tsx not found');
  }
  pass('Wallet Components', 'web3-wallet.tsx exists');

  // Check API endpoints
  log(colors.blue, '\n📋 Test 5: API Endpoints');
  const apiDir = path.resolve('src/app/api');
  if (!fs.existsSync(apiDir)) {
    fail('API', 'API directory not found');
  }

  const endpoints = fs.readdirSync(apiDir).filter(f => 
    fs.statSync(path.join(apiDir, f)).isDirectory()
  );

  if (endpoints.length < 5) {
    warn('API Endpoints', `Only ${endpoints.length} endpoint groups found (expected 5+)`);
  } else {
    pass('API Endpoints', `${endpoints.length} endpoint groups found`);
  }

  // Check Services
  log(colors.blue, '\n📋 Test 6: Services');
  const servicesDir = path.resolve('src/services');
  if (fs.existsSync(servicesDir)) {
    const services = fs.readdirSync(servicesDir);
    pass('Services', `${services.length} service files present`);
  } else {
    warn('Services', 'Services directory not found');
  }

  // Check Database Config
  log(colors.blue, '\n📋 Test 7: Database Configuration');
  if (envContent.includes('DATABASE_URL')) {
    pass('Database URL', 'Configured in .env.local');
  } else {
    warn('Database URL', 'Not configured (optional for testing)');
  }

  // Summary
  log(colors.blue, '\n' + '='.repeat(60));
  log(colors.green, '✅ Environment Ready for E2E Testing!\n');

  console.log('Next Steps:');
  console.log('1. Start the app:        npm run dev');
  console.log('2. Open browser:         http://localhost:3000');
  console.log('3. Connect Phantom:      Click "Connect Wallet"');
  console.log('4. Create Subscription:  Fill form and submit');
  console.log('5. Verify on Explorer:   https://explorer.solana.com/?cluster=devnet\n');

  process.exit(0);
}

main().catch(err => {
  fail('Script Error', err.message);
});
