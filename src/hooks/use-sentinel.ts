import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { SentinelClient } from "@/lib/web3-client";

/**
 * Hook to manage Sentinel client initialization and interactions
 */
export function useSentinelClient() {
  const { wallet, publicKey, signTransaction } = useWallet();
  const [client, setClient] = useState<SentinelClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize client
  useEffect(() => {
    if (!publicKey || !wallet) {
      setClient(null);
      setIsInitialized(false);
      return;
    }

    const initializeClient = async () => {
      try {
        setLoading(true);
        const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;
        if (!programId) {
          throw new Error("NEXT_PUBLIC_PROGRAM_ID not set in environment variables");
        }

        const newClient = new SentinelClient(
          "https://api.devnet.solana.com",
          programId
        );

        // Initialize provider with wallet
        await newClient.initializeProvider(wallet);
        setClient(newClient);
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize client";
        setError(errorMessage);
        console.error("Client initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeClient();
  }, [publicKey, wallet]);

  return { client, isInitialized, error, loading, publicKey };
}

/**
 * Hook for managing registry operations
 */
export function useRegistryOperations() {
  const { client, publicKey } = useSentinelClient();
  const [registry, setRegistry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeRegistry = useCallback(async () => {
    if (!client || !publicKey) return;

    try {
      setLoading(true);
      const tx = await client.initializeRegistry();
      console.log("Registry initialized:", tx);
      // Fetch updated registry data
      await fetchRegistry();
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize registry";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [client, publicKey]);

  const fetchRegistry = useCallback(async () => {
    if (!client || !publicKey) return;

    try {
      const registryData = await client.getRegistry(publicKey);
      setRegistry(registryData);
      return registryData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch registry";
      setError(errorMessage);
      console.error("Registry fetch error:", err);
    }
  }, [client, publicKey]);

  return { registry, loading, error, initializeRegistry, fetchRegistry };
}

/**
 * Hook for managing subscription operations
 */
export function useSubscriptionOperations() {
  const { client, publicKey } = useSentinelClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSubscription = useCallback(
    async (tokenMint: string, riskThreshold: number, priceThreshold: number) => {
      if (!client || !publicKey) throw new Error("Client or wallet not initialized");

      try {
        setLoading(true);
        setError(null);
        const result = await client.createSubscription(
          new PublicKey(tokenMint),
          riskThreshold,
          priceThreshold
        );
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create subscription";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client, publicKey]
  );

  const updateSubscription = useCallback(
    async (subscriptionAddress: string, newRiskThreshold: number, newPriceThreshold: number) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const tx = await client.updateSubscription(
          new PublicKey(subscriptionAddress),
          newRiskThreshold,
          newPriceThreshold
        );
        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update subscription";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const pauseSubscription = useCallback(
    async (subscriptionAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const tx = await client.pauseSubscription(new PublicKey(subscriptionAddress));
        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to pause subscription";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const resumeSubscription = useCallback(
    async (subscriptionAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const tx = await client.resumeSubscription(new PublicKey(subscriptionAddress));
        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to resume subscription";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const cancelSubscription = useCallback(
    async (subscriptionAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const tx = await client.cancelSubscription(new PublicKey(subscriptionAddress));
        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to cancel subscription";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const getSubscription = useCallback(
    async (subscriptionAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        const subscription = await client.getSubscription(new PublicKey(subscriptionAddress));
        return subscription;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch subscription";
        setError(errorMessage);
        throw err;
      }
    },
    [client]
  );

  return {
    loading,
    error,
    createSubscription,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    getSubscription,
  };
}

/**
 * Hook for managing alert operations
 */
export function useAlertOperations() {
  const { client } = useSentinelClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const triggerAlert = useCallback(
    async (
      subscriptionAddress: string,
      currentRiskScore: number,
      priceChangePercent: number,
      alertMessage: string
    ) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const result = await client.triggerAlert(
          new PublicKey(subscriptionAddress),
          currentRiskScore,
          priceChangePercent,
          alertMessage
        );
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to trigger alert";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const confirmAlertDelivery = useCallback(
    async (alertAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const tx = await client.confirmAlertDelivery(new PublicKey(alertAddress));
        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to confirm delivery";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const markAlertFailed = useCallback(
    async (alertAddress: string, reason: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        setLoading(true);
        setError(null);
        const tx = await client.markAlertFailed(new PublicKey(alertAddress), reason);
        return tx;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to mark alert failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [client]
  );

  const getAlert = useCallback(
    async (alertAddress: string) => {
      if (!client) throw new Error("Client not initialized");

      try {
        const alert = await client.getAlert(new PublicKey(alertAddress));
        return alert;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch alert";
        setError(errorMessage);
        throw err;
      }
    },
    [client]
  );

  return {
    loading,
    error,
    triggerAlert,
    confirmAlertDelivery,
    markAlertFailed,
    getAlert,
  };
}
