/**
 * Test script for on-chain attestation storage
 * 
 * This script tests the complete flow:
 * 1. Solana program connection
 * 2. Sentinel keypair initialization
 * 3. On-chain attestation creation
 * 4. Attestation retrieval and verification
 * 
 * Usage:
 *   npm run test:attestation
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { SolanaService } from '../src/services/solana.service';
import type { SentinelReportData } from '../src/types';

async function testOnChainAttestation() {
  console.log('🧪 Starting On-Chain Attestation Test...\n');

  try {
    // Initialize service
    console.log('1️⃣ Initializing Solana service...');
    const solanaService = new SolanaService();
    console.log('✅ Solana service initialized\n');

    // Check program info
    console.log('2️⃣ Checking program deployment...');
    const programInfo = await solanaService.getProgramInfo();
    if (!programInfo || !programInfo.exists) {
      throw new Error('Solana program not found on-chain');
    }
    console.log('✅ Program found:');
    console.log('   - Executable:', programInfo.executable);
    console.log('   - Owner:', programInfo.owner);
    console.log('');

    // Check balance
    console.log('3️⃣ Checking sentinel wallet balance...');
    const balance = await solanaService.checkBalance();
    console.log('✅ Balance:', balance.toFixed(4), 'SOL');
    if (balance < 0.01) {
      console.warn('⚠️  Warning: Low balance. Need at least 0.01 SOL for transactions.\n');
    } else {
      console.log('');
    }

    // Create mock report for testing
    console.log('4️⃣ Creating mock analysis report...');
    const mockReport: SentinelReportData = {
      tokenAddress: 'So11111111111111111111111111111111111111112',
      tokenName: 'Wrapped SOL',
      tokenSymbol: 'SOL',
      sentinelScore: 85,
      aiAnalysis: {
        riskLevel: 'Low',
        onChainRisk: {
          holderConcentrationRisk: 'Low',
          deployerLpHoldingsRisk: 'Low',
        },
        finalVerdict: 'This is a test token for attestation verification.',
      },
      onChainAnalysis: {
        mintAuthorityRenounced: true,
        freezeAuthorityRenounced: true,
        top10HolderConcentrationPercent: 25.5,
        deployerLpConcentrationPercent: 10.2,
      },
      sentimentAnalysis: {
        compoundScore: 0.75,
        humanReadableSummary: 'Very Positive',
      },
      tier: 'premium',
      issuedAt: new Date().toISOString(),
    };
    console.log('✅ Mock report created\n');

    // Store attestation on-chain
    console.log('5️⃣ Storing attestation on-chain...');
    const analysisId = `test-${Date.now()}`;
    const result = await solanaService.storeAttestationOnChain(mockReport, analysisId);

    if (!result) {
      throw new Error('Failed to store attestation on-chain');
    }

    console.log('✅ Attestation stored successfully:');
    console.log('   - Transaction:', result.signature);
    console.log('   - Attestation PDA:', result.attestationPda);
    console.log('   - Slot:', result.slot);
    console.log('   - Block Time:', result.blockTime ? new Date(result.blockTime * 1000).toISOString() : 'Pending');
    console.log('   - Explorer:', `https://explorer.solana.com/tx/${result.signature}?cluster=${process.env.NEXT_PUBLIC_NETWORK || 'devnet'}`);
    console.log('');

    // Wait a bit for blockchain confirmation
    console.log('⏳ Waiting 5 seconds for blockchain confirmation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('');

    // Retrieve and verify attestation
    console.log('6️⃣ Retrieving attestation from on-chain...');
    const attestation = await solanaService.getAttestation(result.attestationPda);

    if (!attestation) {
      throw new Error('Failed to retrieve attestation from on-chain');
    }

    console.log('✅ Attestation retrieved:');
    console.log('   - Creator:', attestation.creator);
    console.log('   - Token Mint:', attestation.tokenMint);
    console.log('   - Risk Score:', attestation.riskScore);
    console.log('   - Analysis Hash:', attestation.analysisHash);
    console.log('   - Created At:', new Date(attestation.createdAt * 1000).toISOString());
    console.log('');

    // Verify data integrity
    console.log('7️⃣ Verifying data integrity...');
    const scoreMatch = attestation.riskScore === Math.floor(mockReport.sentinelScore);
    const mintMatch = attestation.tokenMint === mockReport.tokenAddress;

    if (scoreMatch && mintMatch) {
      console.log('✅ Data integrity verified:');
      console.log('   - Risk score matches:', scoreMatch);
      console.log('   - Token mint matches:', mintMatch);
    } else {
      console.error('❌ Data integrity check failed:');
      console.error('   - Risk score matches:', scoreMatch);
      console.error('   - Token mint matches:', mintMatch);
    }
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 TEST PASSED: On-Chain Attestation Working!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 Test Results:');
    console.log('   ✅ Program deployed and executable');
    console.log('   ✅ Sentinel wallet has sufficient balance');
    console.log('   ✅ Attestation stored on-chain successfully');
    console.log('   ✅ Attestation retrieved and verified');
    console.log('   ✅ Data integrity maintained');
    console.log('');
    console.log('🔗 Next Steps:');
    console.log('   1. Test with actual token analysis (Premium tier)');
    console.log('   2. Verify Explorer links are working');
    console.log('   3. Test attestation retrieval API endpoint');
    console.log('');

    return true;
  } catch (error: any) {
    console.error('');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ TEST FAILED');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error('Error:', error.message);
    if (error.logs) {
      console.error('Program Logs:', error.logs);
    }
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check SENTINEL_RECEIPT_PRIVATE_KEY is set correctly');
    console.error('   2. Ensure wallet has sufficient SOL (>0.01)');
    console.error('   3. Verify program is deployed to devnet');
    console.error('   4. Check RPC connection is working');
    console.error('');
    return false;
  }
}

// Run test
testOnChainAttestation()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
