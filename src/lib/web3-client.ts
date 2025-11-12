import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey, Connection, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import type { Idl } from "@coral-xyz/anchor";

export class SentinelClient {
  private program: Program<Idl> | null = null;
  private provider: AnchorProvider | null = null;
  private connection: Connection;
  private programId: PublicKey;

  constructor(
    rpcUrl: string = "https://api.devnet.solana.com",
    programId: string = process.env.NEXT_PUBLIC_PROGRAM_ID || ""
  ) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.programId = new PublicKey(programId);
  }

  /**
   * Initialize the provider with a wallet
   */
  async initializeProvider(wallet: any): Promise<void> {
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(this.provider);
  }

  /**
   * Initialize the registry for a user
   */
  async initializeRegistry(): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const [registryPda, registryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const tx = await this.program.methods
      .initializeRegistry(registryBump)
      .accounts({
        registry: registryPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    tokenMint: PublicKey,
    riskThreshold: number,
    priceThreshold: number
  ): Promise<{ subscriptionAddress: PublicKey; txSignature: string }> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const subscriptionKeypair = Keypair.generate();
    const [, registryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const tx = await this.program.methods
      .createSubscription(tokenMint, riskThreshold, priceThreshold)
      .accounts({
        subscription: subscriptionKeypair.publicKey,
        registry: registryPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([subscriptionKeypair])
      .rpc();

    return {
      subscriptionAddress: subscriptionKeypair.publicKey,
      txSignature: tx,
    };
  }

  /**
   * Update subscription thresholds
   */
  async updateSubscription(
    subscriptionAddress: PublicKey,
    newRiskThreshold: number,
    newPriceThreshold: number
  ): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;

    const tx = await this.program.methods
      .updateSubscription(newRiskThreshold, newPriceThreshold)
      .accounts({
        subscription: subscriptionAddress,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Pause a subscription
   */
  async pauseSubscription(subscriptionAddress: PublicKey): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const tx = await this.program.methods
      .pauseSubscription()
      .accounts({
        subscription: subscriptionAddress,
        registry: registryPda,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Resume a subscription
   */
  async resumeSubscription(subscriptionAddress: PublicKey): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const tx = await this.program.methods
      .resumeSubscription()
      .accounts({
        subscription: subscriptionAddress,
        registry: registryPda,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionAddress: PublicKey): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const tx = await this.program.methods
      .cancelSubscription()
      .accounts({
        subscription: subscriptionAddress,
        registry: registryPda,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(
    subscriptionAddress: PublicKey,
    currentRiskScore: number,
    priceChangePercent: number,
    alertMessage: string
  ): Promise<{ alertAddress: PublicKey; txSignature: string }> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), wallet.publicKey.toBuffer()],
      this.programId
    );

    const alertKeypair = Keypair.generate();

    const tx = await this.program.methods
      .triggerAlert(currentRiskScore, priceChangePercent, alertMessage)
      .accounts({
        alert: alertKeypair.publicKey,
        subscription: subscriptionAddress,
        registry: registryPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([alertKeypair])
      .rpc();

    return {
      alertAddress: alertKeypair.publicKey,
      txSignature: tx,
    };
  }

  /**
   * Confirm alert delivery
   */
  async confirmAlertDelivery(alertAddress: PublicKey): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;

    const tx = await this.program.methods
      .confirmAlertDelivery()
      .accounts({
        alert: alertAddress,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Mark alert as failed
   */
  async markAlertFailed(alertAddress: PublicKey, reason: string): Promise<string> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;

    const tx = await this.program.methods
      .markAlertFailed(reason)
      .accounts({
        alert: alertAddress,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Create an attestation record
   */
  async createAttestation(
    tokenMint: PublicKey,
    riskScore: number,
    analysisHash: Uint8Array
  ): Promise<{ attestationAddress: PublicKey; txSignature: string }> {
    if (!this.provider || !this.program) {
      throw new Error("Provider not initialized");
    }

    const wallet = this.provider.wallet as anchor.Wallet;
    const attestationKeypair = Keypair.generate();

    const tx = await this.program.methods
      .createAttestation(tokenMint, riskScore, Array.from(analysisHash) as any)
      .accounts({
        attestation: attestationKeypair.publicKey,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([attestationKeypair])
      .rpc();

    return {
      attestationAddress: attestationKeypair.publicKey,
      txSignature: tx,
    };
  }

  /**
   * Get subscription data
   */
  async getSubscription(subscriptionAddress: PublicKey): Promise<any> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    const subscription = await (this.program.account as any).subscription.fetch(subscriptionAddress);
    return subscription;
  }

  /**
   * Get alert data
   */
  async getAlert(alertAddress: PublicKey): Promise<any> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    const alert = await (this.program.account as any).alert.fetch(alertAddress);
    return alert;
  }

  /**
   * Get registry data
   */
  async getRegistry(ownerAddress: PublicKey): Promise<any> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    const [registryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("registry"), ownerAddress.toBuffer()],
      this.programId
    );

    const registry = await (this.program.account as any).registry.fetch(registryPda);
    return registry;
  }

  /**
   * Get attestation data
   */
  async getAttestation(attestationAddress: PublicKey): Promise<any> {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    const attestation = await (this.program.account as any).attestation.fetch(attestationAddress);
    return attestation;
  }

  /**
   * Listen to events
   */
  subscribeToEvents(callback: (event: any) => void): number {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    return this.program.addEventListener("*", (event: any) => {
      callback(event);
    });
  }

  /**
   * Unsubscribe from events
   */
  unsubscribeFromEvents(listener: number): void {
    if (!this.program) {
      throw new Error("Program not initialized");
    }

    this.program.removeEventListener(listener);
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get provider
   */
  getProvider(): AnchorProvider | null {
    return this.provider;
  }
}

// Singleton instance
let clientInstance: SentinelClient | null = null;

export function getSentinelClient(): SentinelClient {
  if (!clientInstance) {
    clientInstance = new SentinelClient();
  }
  return clientInstance;
}

export function initializeSentinelClient(
  rpcUrl: string = "https://api.devnet.solana.com",
  programId: string = process.env.NEXT_PUBLIC_PROGRAM_ID || ""
): SentinelClient {
  clientInstance = new SentinelClient(rpcUrl, programId);
  return clientInstance;
}
