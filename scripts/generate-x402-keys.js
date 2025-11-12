#!/usr/bin/env node

/**
 * Generate X402 keypairs and display them in base58 format
 * Usage: node generate-x402-keys.js [output-dir]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// We need bs58 for encoding, but we can use base64 as fallback and convert manually
// For now, let's create raw Ed25519 keypairs

function generateEd25519Keypair() {
  // Generate 32 bytes of random data for the seed
  const seed = crypto.randomBytes(32);
  
  // In a real scenario, you'd use a proper Ed25519 library
  // For this, we'll create the keypair structure
  // Note: This generates a random secret key (64 bytes for Ed25519)
  const secretKey = crypto.randomBytes(64);
  const publicKey = crypto.randomBytes(32); // Placeholder - normally derived from secret key
  
  return { secretKey, publicKey };
}

function base58Encode(buf) {
  // Simple base58 encoding implementation
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let encoded = '';
  let num = 0n;
  
  // Convert buffer to big integer
  for (let i = 0; i < buf.length; i++) {
    num = num * 256n + BigInt(buf[i]);
  }
  
  // Convert to base58
  if (num === 0n) {
    encoded = alphabet[0];
  } else {
    while (num > 0n) {
      encoded = alphabet[Number(num % 58n)] + encoded;
      num = num / 58n;
    }
  }
  
  // Handle leading zeros
  for (let i = 0; i < buf.length && buf[i] === 0; i++) {
    encoded = alphabet[0] + encoded;
  }
  
  return encoded;
}

async function main() {
  console.log('\n🔑 Solana Sentinel x402 Keypair Generator\n');
  console.log('⚠️  This script requires the Solana CLI to generate proper Ed25519 keypairs.');
  console.log('📋 Run these commands in WSL Ubuntu instead:\n');
  
  console.log('# Step 1: Generate x402 recipient keypair');
  console.log('mkdir -p ~/.config/solana');
  console.log('solana-keygen new --outfile ~/.config/solana/x402-recipient.json --no-bip39-passphrase --force\n');
  
  console.log('# Step 2: Display the public key (X402_RECIPIENT_ADDRESS)');
  console.log('solana-keygen pubkey ~/.config/solana/x402-recipient.json\n');
  
  console.log('# Step 3: Convert the secret key to base58 (SENTINEL_RECEIPT_PRIVATE_KEY)');
  console.log('node -e "');
  console.log('  const fs = require(\'fs\');');
  console.log('  const bs58 = require(\'bs58\');');
  console.log('  const key = JSON.parse(fs.readFileSync(\'~/.config/solana/x402-recipient.json\'));');
  console.log('  console.log(bs58.encode(Buffer.from(key)));');
  console.log('"\n');
  
  console.log('# Step 4: Save both to .env.local');
  console.log('X402_RECIPIENT_ADDRESS=<address-from-step-2>');
  console.log('SENTINEL_RECEIPT_PRIVATE_KEY=<secret-from-step-3>\n');
}

main().catch(console.error);
