import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import bs58 from 'bs58';
import { createHash } from 'crypto';

import type { SentinelReportData } from '@/types';

// IDL type for the Sentinel program
interface SentinelIDL {
  version: string;
  name: string;
  instructions: any[];
}

export interface OnChainAttestationResult {
  signature: string;
  attestationPda: string;
  slot: number;
  blockTime: number | null;
}

export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;
  private sentinelKeypair: Keypair | null = null;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    const programIdStr = process.env.NEXT_PUBLIC_PROGRAM_ID;
    if (!programIdStr) {
      throw new Error('NEXT_PUBLIC_PROGRAM_ID not configured');
    }
    this.programId = new PublicKey(programIdStr);

    // Initialize sentinel keypair from private key
    this.initializeSentinelKeypair();
  }

  private initializeSentinelKeypair(): void {
    const secretKeyBase58 = process.env.SENTINEL_RECEIPT_PRIVATE_KEY;
    if (!secretKeyBase58) {
      console.warn('⚠️ SENTINEL_RECEIPT_PRIVATE_KEY not configured - on-chain attestations disabled');
      return;
    }

    try {
      let secretKey = bs58.decode(secretKeyBase58);
      
      // Handle potential prefix byte
      if (secretKey.length === 65) {
        secretKey = secretKey.slice(1);
      }
      
      if (secretKey.length !== 64) {
        throw new Error(`Invalid secret key length: ${secretKey.length}, expected 64`);
      }

      this.sentinelKeypair = Keypair.fromSecretKey(secretKey);
      console.log('✅ Sentinel keypair initialized:', this.sentinelKeypair.publicKey.toBase58());
    } catch (error) {
      console.error('❌ Failed to initialize sentinel keypair:', error);
      this.sentinelKeypair = null;
    }
  }

  /**
   * Generate SHA-256 hash of the report data (same as AttestationService)
   */
  private hashReport(report: SentinelReportData): Buffer {
    const payload = JSON.stringify({
      tokenAddress: report.tokenAddress,
      tokenName: report.tokenName,
      tokenSymbol: report.tokenSymbol,
      sentinelScore: report.sentinelScore,
      aiAnalysis: report.aiAnalysis,
      onChainAnalysis: report.onChainAnalysis,
      sentimentAnalysis: report.sentimentAnalysis,
      issuedAt: report.issuedAt,
    });

    return createHash('sha256').update(payload).digest();
  }

  /**
   * Store an attestation on-chain using the Sentinel program
   */
  public async storeAttestationOnChain(
    report: SentinelReportData,
    analysisId: string
  ): Promise<OnChainAttestationResult | null> {
    if (!this.sentinelKeypair) {
      console.warn('⚠️ Sentinel keypair not available - skipping on-chain storage');
      return null;
    }

    try {
      console.log('🔗 Storing attestation on-chain for analysis:', analysisId);

      const tokenMint = new PublicKey(report.tokenAddress);
      const riskScore = Math.floor(report.sentinelScore);
      const analysisHash = Array.from(this.hashReport(report));

      // Generate a unique attestation account
      const attestationKeypair = Keypair.generate();

      // Build the instruction manually since we don't have the full IDL
      const instruction = await this.buildCreateAttestationInstruction(
        attestationKeypair.publicKey,
        this.sentinelKeypair.publicKey,
        tokenMint,
        riskScore,
        analysisHash
      );

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.sentinelKeypair.publicKey;
      transaction.sign(this.sentinelKeypair, attestationKeypair);

      const signature = await this.connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );

      console.log('📝 Transaction sent:', signature);

      // Confirm transaction
      const confirmation = await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        console.error('❌ Transaction failed:', confirmation.value.err);
        return null;
      }

      console.log('✅ Attestation stored on-chain successfully');

      // Get transaction details
      const txDetails = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
      });

      return {
        signature,
        attestationPda: attestationKeypair.publicKey.toBase58(),
        slot: txDetails?.slot || 0,
        blockTime: txDetails?.blockTime || null,
      };
    } catch (error: any) {
      console.error('❌ Failed to store attestation on-chain:', error);
      console.error('Error details:', {
        message: error?.message,
        logs: error?.logs,
        code: error?.code,
      });
      return null;
    }
  }

  /**
   * Build the create_attestation instruction manually
   */
  private async buildCreateAttestationInstruction(
    attestationAccount: PublicKey,
    creator: PublicKey,
    tokenMint: PublicKey,
    riskScore: number,
    analysisHash: number[]
  ): Promise<web3.TransactionInstruction> {
    // Instruction discriminator for create_attestation
    // This is calculated as the first 8 bytes of sha256("global:create_attestation")
    const discriminator = Buffer.from([
      49, 24, 67, 80, 12, 249, 96, 239
    ]);

    // Serialize instruction data
    const data = Buffer.alloc(discriminator.length + 32 + 2 + 32);
    let offset = 0;

    // Write discriminator
    discriminator.copy(data, offset);
    offset += discriminator.length;

    // Write token_mint (32 bytes)
    tokenMint.toBuffer().copy(data, offset);
    offset += 32;

    // Write risk_score (u16, 2 bytes, little-endian)
    data.writeUInt16LE(riskScore, offset);
    offset += 2;

    // Write analysis_hash (32 bytes)
    Buffer.from(analysisHash).copy(data, offset);

    // Build accounts
    const keys = [
      { pubkey: attestationAccount, isSigner: true, isWritable: true },
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    return new web3.TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }

  /**
   * Retrieve an attestation from on-chain
   */
  public async getAttestation(attestationPda: string): Promise<any | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(
        new PublicKey(attestationPda)
      );

      if (!accountInfo) {
        console.warn('⚠️ Attestation account not found:', attestationPda);
        return null;
      }

      // Deserialize account data (simplified - full deserialization requires IDL)
      const data = accountInfo.data;
      
      // Skip discriminator (8 bytes)
      let offset = 8;
      
      // Read creator (32 bytes)
      const creator = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;
      
      // Read token_mint (32 bytes)
      const tokenMint = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;
      
      // Read risk_score (2 bytes)
      const riskScore = data.readUInt16LE(offset);
      offset += 2;
      
      // Read analysis_hash (32 bytes)
      const analysisHash = Array.from(data.slice(offset, offset + 32));
      offset += 32;
      
      // Read created_at (8 bytes, i64)
      const createdAt = Number(data.readBigInt64LE(offset));

      return {
        creator: creator.toBase58(),
        tokenMint: tokenMint.toBase58(),
        riskScore,
        analysisHash: Buffer.from(analysisHash).toString('hex'),
        createdAt,
      };
    } catch (error) {
      console.error('❌ Failed to retrieve attestation:', error);
      return null;
    }
  }

  /**
   * Check if a keypair has enough SOL for transaction fees
   */
  public async checkBalance(): Promise<number> {
    if (!this.sentinelKeypair) {
      return 0;
    }

    try {
      const balance = await this.connection.getBalance(this.sentinelKeypair.publicKey);
      return balance / web3.LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('❌ Failed to check balance:', error);
      return 0;
    }
  }

  /**
   * Get program information
   */
  public async getProgramInfo(): Promise<{
    exists: boolean;
    executable: boolean;
    owner: string;
  } | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.programId);
      
      if (!accountInfo) {
        return { exists: false, executable: false, owner: '' };
      }

      return {
        exists: true,
        executable: accountInfo.executable,
        owner: accountInfo.owner.toBase58(),
      };
    } catch (error) {
      console.error('❌ Failed to get program info:', error);
      return null;
    }
  }
}
