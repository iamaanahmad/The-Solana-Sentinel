'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnection } from '@/components/web3-wallet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash2, TrendingUp, Shield, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  subscription_id: string;
  token_address: string;
  agent_pubkey: string;
  webhook_url: string;
  thresholds: { risk_score?: number };
  status: 'active' | 'paused' | 'cancelled';
  prepaid_balance: number;
  alerts_triggered: number;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionsPage() {
  const { connected, publicKey } = useWallet();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Form state
  const [tokenAddress, setTokenAddress] = useState('');
  const [riskThreshold, setRiskThreshold] = useState(75);
import { useToast } from '@/hooks/use-toast';
import {
  Trash2,
  Pause,
  Play,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

interface Subscription {
  id: string;
  token: string;
  symbol: string;
  address: string;
  riskThreshold: number;
  currentPrice: number;
  priceChange24h: number;
  riskScore: number;
  status: 'active' | 'paused' | 'alert';
  alertsThisWeek: number;
  createdAt: string;
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Mock data - in production, fetch from /api/subscribe
      const mockSubs: Subscription[] = [
        {
          id: 'sub-001',
          token: 'Solana',
          symbol: 'SOL',
          address: 'So11111111111111111111111111111111111111112',
          riskThreshold: 75,
          currentPrice: 142.35,
          priceChange24h: 5.2,
          riskScore: 45,
          status: 'active',
          alertsThisWeek: 2,
          createdAt: '2024-01-10',
        },
        {
          id: 'sub-002',
          token: 'USDC',
          symbol: 'USDC',
          address: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
          riskThreshold: 50,
          currentPrice: 1.0,
          priceChange24h: 0.1,
          riskScore: 18,
          status: 'active',
          alertsThisWeek: 0,
          createdAt: '2024-01-05',
        },
        {
          id: 'sub-003',
          token: 'Orca',
          symbol: 'ORCA',
          address: 'orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS',
          riskThreshold: 80,
          currentPrice: 2.45,
          priceChange24h: -8.3,
          riskScore: 72,
          status: 'alert',
          alertsThisWeek: 5,
          createdAt: '2024-01-08',
        },
      ];
      setSubscriptions(mockSubs);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load subscriptions',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    try {
      // In production: await fetch(`/api/subscribe/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'paused' }) })
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === id ? { ...sub, status: 'paused' as const } : sub
        )
      );
      toast({
        title: 'Success',
        description: 'Subscription paused',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to pause subscription',
      });
    }
  };

  const handleResume = async (id: string) => {
    try {
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === id ? { ...sub, status: 'active' as const } : sub
        )
      );
      toast({
        title: 'Success',
        description: 'Subscription resumed',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resume subscription',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // In production: await fetch(`/api/subscribe/${id}`, { method: 'DELETE' })
      setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      toast({
        title: 'Success',
        description: 'Subscription deleted',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete subscription',
      });
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Subscription Management</h1>
              <p className="text-muted-foreground mt-2">
                Monitor and manage your token price monitoring subscriptions
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start monitoring tokens by analyzing them on the dashboard
              </p>
              <Button asChild>
                <Link href="/">Analyze a Token</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions ({subscriptions.length})</CardTitle>
              <CardDescription>
                Manage your token monitoring subscriptions and view real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>24h Change</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Alerts</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-bold">{sub.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {sub.token}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>${sub.currentPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center gap-1 ${
                              sub.priceChange24h > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {sub.priceChange24h > 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {Math.abs(sub.priceChange24h).toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`font-bold ${getRiskColor(sub.riskScore)}`}>
                            {sub.riskScore}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            {sub.alertsThisWeek}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                              sub.status
                            )}`}
                          >
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sub.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePause(sub.id)}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResume(sub.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the subscription for{' '}
                                  <strong>{sub.symbol}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                                <div className="flex justify-end gap-2">
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(sub.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Switchboard Oracle Integration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Switchboard Oracle Integration</CardTitle>
            <CardDescription>
              Real-time price feeds powered by Switchboard oracle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Real-time Data</h4>
                <p className="text-sm text-muted-foreground">
                  Prices updated every minute from Switchboard feeds
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Multiple Networks</h4>
                <p className="text-sm text-muted-foreground">
                  Mainnet, Devnet, and Testnet support
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Webhook Alerts</h4>
                <p className="text-sm text-muted-foreground">
                  Instant notifications when thresholds are breached
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>&copy; {new Date().getFullYear()} The Solana Sentinel. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
