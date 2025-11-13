/**
 * Generate a valid Solana Ed25519 keypair for SENTINEL_RECEIPT_PRIVATE_KEY
 * 
 * Usage: tsx scripts/generate-keypair.ts
 */

import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

console.log('🔑 Generating Solana Ed25519 Keypair...\n');

const keypair = Keypair.generate();

const secretKeyBase58 = bs58.encode(keypair.secretKey);
const publicKey = keypair.publicKey.toBase58();

console.log('✅ Keypair Generated Successfully!\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Public Key (Wallet Address):');
console.log(publicKey);
console.log('');
console.log('Private Key (Base58, 64 bytes):');
console.log(secretKeyBase58);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📝 Add to .env.local:');
console.log('');
console.log(`SENTINEL_RECEIPT_PRIVATE_KEY=${secretKeyBase58}`);
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('   1. Replace the current SENTINEL_RECEIPT_PRIVATE_KEY in .env.local');
console.log('   2. Fund this wallet with devnet SOL: https://faucet.solana.com');
console.log('   3. Keep this private key secret and never commit to git');
console.log('');
console.log('📊 Key Details:');
console.log(`   - Secret Key Length: ${keypair.secretKey.length} bytes`);
console.log(`   - Base58 Length: ${secretKeyBase58.length} characters`);
console.log(`   - Public Key: ${publicKey}`);
console.log('');
