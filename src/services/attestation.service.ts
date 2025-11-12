import { createHash } from 'crypto';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

import type { SentinelReportData, AttestationMetadata } from '@/types';

export interface AttestationPayload {
  reportHash: string;
  timestamp: string;
  sentinelScore: number;
  tokenAddress: string;
  tier: string;
  analysisId: string;
}

export class AttestationService {
  private getSigningKey(): { publicKey: Uint8Array; secretKey: Uint8Array } {
    const secretKeyBase58 = process.env.SENTINEL_RECEIPT_PRIVATE_KEY;
    if (!secretKeyBase58) {
      throw new Error('SENTINEL_RECEIPT_PRIVATE_KEY not configured');
    }

    const secretKey = bs58.decode(secretKeyBase58);
    if (secretKey.length !== 64) {
      throw new Error(`Invalid secret key length: ${secretKey.length}, expected 64`);
    }

    // Extract public key from secret key (last 32 bytes of Ed25519 secret are the seed)
    const publicKey = nacl.sign.keyPair.fromSecretKey(secretKey).publicKey;

    return { publicKey, secretKey };
  }

  /**
   * Generate SHA-256 hash of the report data
   */
  public hashReport(report: SentinelReportData): string {
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

    return createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Sign a report and generate attestation metadata
   */
  public signReport(report: SentinelReportData, analysisId: string): AttestationMetadata {
    const { publicKey, secretKey } = this.getSigningKey();
    const reportHash = this.hashReport(report);

    const payload: AttestationPayload = {
      reportHash,
      timestamp: new Date().toISOString(),
      sentinelScore: report.sentinelScore,
      tokenAddress: report.tokenAddress,
      tier: report.tier,
      analysisId,
    };

    const messageBytes = Buffer.from(JSON.stringify(payload));
    const signature = nacl.sign.detached(messageBytes, secretKey);
    const signatureBase58 = bs58.encode(signature);
    const publicKeyBase58 = bs58.encode(publicKey);

    return {
      signature: signatureBase58,
      publicKey: publicKeyBase58,
      reportHash,
      issuedAt: payload.timestamp,
      network: (process.env.SOLANA_CLUSTER as 'devnet' | 'mainnet-beta' | 'testnet') || 'devnet',
      verified: true,
    };
  }

  /**
   * Verify an attestation signature
   */
  public verifyAttestation(attestation: AttestationMetadata, payload: AttestationPayload): boolean {
    try {
      const publicKeyBuffer = bs58.decode(attestation.publicKey);
      const signatureBuffer = bs58.decode(attestation.signature);
      const messageBytes = Buffer.from(JSON.stringify(payload));

      return nacl.sign.detached.verify(messageBytes, signatureBuffer, publicKeyBuffer);
    } catch (error) {
      console.error('Attestation verification failed:', error);
      return false;
    }
  }

  /**
   * Get the Sentinel's public key for client-side verification
   */
  public getPublicKey(): string {
    const { publicKey } = this.getSigningKey();
    return bs58.encode(publicKey);
  }

  /**
   * Verify a report hash hasn't been tampered with
   */
  public verifyReportHash(report: SentinelReportData, claimedHash: string): boolean {
    const actualHash = this.hashReport(report);
    return actualHash === claimedHash;
  }
}
