"use client";

import React, { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface WalletConnectionProps {
  onWalletConnected?: (publicKey: PublicKey) => void;
  onWalletDisconnected?: () => void;
}

/**
 * WalletConnection Component
 * Handles Phantom wallet connection and displays connection status
 */
export function WalletConnection({
  onWalletConnected,
  onWalletDisconnected,
}: WalletConnectionProps) {
  const { connected, publicKey, connecting, disconnecting } = useWallet();
  const [displayAddress, setDisplayAddress] = useState<string>("");
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      setDisplayAddress(address.substring(0, 6) + "..." + address.substring(address.length - 6));
      onWalletConnected?.(publicKey);
      setShowAlert(false);
    } else {
      setDisplayAddress("");
      onWalletDisconnected?.();
      if (!connecting && !disconnecting) {
        setShowAlert(true);
      }
    }
  }, [connected, publicKey, connecting, disconnecting, onWalletConnected, onWalletDisconnected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
        <div className="flex items-center gap-3">
          {connected ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-700">
              {connected ? "Wallet Connected" : "Connect Your Wallet"}
            </p>
            {connected && displayAddress && (
              <p className="text-xs text-gray-500 font-mono">{displayAddress}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {connecting || disconnecting ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : null}
          <WalletMultiButton />
        </div>
      </div>

      {!connected && showAlert && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Connect your Phantom wallet to interact with the Solana blockchain and manage your subscriptions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface SubscriptionActionProps {
  action: "create" | "update" | "pause" | "resume" | "cancel";
  loading?: boolean;
  onAction: () => Promise<void>;
  label?: string;
  className?: string;
}

/**
 * SubscriptionAction Component
 * Handles subscription-related actions with Phantom wallet
 */
export function SubscriptionAction({
  action,
  loading = false,
  onAction,
  label,
  className = "",
}: SubscriptionActionProps) {
  const { connected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleAction = async () => {
    if (!connected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      await onAction();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error(`${action} action error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const actionLabels: Record<string, string> = {
    create: label || "Create Subscription",
    update: label || "Update Thresholds",
    pause: label || "Pause",
    resume: label || "Resume",
    cancel: label || "Cancel Subscription",
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleAction}
        disabled={!connected || isLoading || loading}
        className={className}
        size="sm"
      >
        {isLoading || loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          actionLabels[action]
        )}
      </Button>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {action === "create" && "Subscription created successfully!"}
            {action === "update" && "Thresholds updated successfully!"}
            {action === "pause" && "Subscription paused."}
            {action === "resume" && "Subscription resumed."}
            {action === "cancel" && "Subscription cancelled."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Transaction Status Component
 * Displays transaction status and links to explorer
 */
interface TransactionStatusProps {
  signature?: string;
  status?: "pending" | "success" | "error";
  error?: string;
  network?: "devnet" | "testnet" | "mainnet";
}

export function TransactionStatus({
  signature,
  status = "pending",
  error,
  network = "devnet",
}: TransactionStatusProps) {
  const explorerUrls = {
    devnet: "https://explorer.solana.com/tx",
    testnet: "https://explorer.solana.com/tx?cluster=testnet",
    mainnet: "https://explorer.solana.com/tx",
  };

  const baseUrl = explorerUrls[network];
  const explorerUrl = signature ? `${baseUrl}/${signature}` : null;

  if (!signature && status !== "pending") return null;

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg border">
      {status === "pending" && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
      {status === "success" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
      {status === "error" && <AlertCircle className="w-4 h-4 text-red-600" />}

      <div className="flex-1">
        <p className="text-sm font-medium">
          {status === "pending" && "Transaction pending..."}
          {status === "success" && "Transaction confirmed!"}
          {status === "error" && `Error: ${error || "Unknown error"}`}
        </p>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View on Solana Explorer
          </a>
        )}
      </div>
    </div>
  );
}
