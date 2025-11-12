'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, TrendingDown, TrendingUp, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface Alert {
  id: string;
  token: string;
  address: string;
  riskScore: number;
  priceChange: number;
  status: 'delivered' | 'failed' | 'pending';
  deliveredAt?: string;
  triggeredAt?: string;
  failureReason?: string;
  subscriptionId: string;
}

export default function HistoryPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/history?limit=100&filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      } else {
        // Fallback to mock data
        const mockAlerts: Alert[] = [
          {
            id: 'alert-001',
            token: 'SOL',
            address: 'So11111111111111111111111111111111111111112',
            riskScore: 82,
            priceChange: 8.5,
            status: 'delivered',
            deliveredAt: new Date(Date.now() - 10000).toISOString(),
            subscriptionId: 'sub-001',
          },
          {
            id: 'alert-002',
            token: 'USDC',
            address: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
            riskScore: 95,
            priceChange: 12.3,
            status: 'delivered',
            deliveredAt: new Date(Date.now() - 45000).toISOString(),
            subscriptionId: 'sub-002',
          },
          {
            id: 'alert-003',
            token: 'ORCA',
            address: 'orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS',
            riskScore: 45,
            priceChange: 2.1,
            status: 'pending',
            triggeredAt: new Date(Date.now() - 300000).toISOString(),
            subscriptionId: 'sub-003',
          },
          {
            id: 'alert-004',
            token: 'SOL',
            address: 'So11111111111111111111111111111111111111112',
            riskScore: 88,
            priceChange: 11.2,
            status: 'failed',
            failureReason: 'Webhook timeout',
            triggeredAt: new Date(Date.now() - 3600000).toISOString(),
            subscriptionId: 'sub-001',
          },
          {
            id: 'alert-005',
            token: 'ORCA',
            address: 'orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS',
            riskScore: 72,
            priceChange: -5.8,
            status: 'delivered',
            deliveredAt: new Date(Date.now() - 7200000).toISOString(),
            subscriptionId: 'sub-003',
          },
        ];

        const filtered = mockAlerts.filter((alert) => {
          if (filter === 'delivered') return alert.status === 'delivered';
          if (filter === 'failed') return alert.status === 'failed';
          if (filter === 'pending') return alert.status === 'pending';
          return true;
        });

        setAlerts(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load alert history',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(alerts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alert-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
              <h1 className="text-3xl font-bold">Alert History</h1>
              <p className="text-muted-foreground mt-2">
                View and track all price anomaly alerts triggered by your subscriptions
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="lg">
                ← Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Your price monitoring alerts will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Alerts ({alerts.length})</CardTitle>
                    <CardDescription>
                      Track all triggered alerts and their delivery status
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Alerts</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportAsJSON}
                      disabled={alerts.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Price Change</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-bold">{alert.token}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {alert.address.substring(0, 8)}...
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`font-bold ${
                                alert.riskScore < 30
                                  ? 'text-green-600'
                                  : alert.riskScore < 70
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {alert.riskScore}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div
                              className={`flex items-center gap-1 ${
                                alert.priceChange > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {alert.priceChange > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {Math.abs(alert.priceChange).toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                alert.status
                              )}`}
                            >
                              {alert.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getTimeAgo(
                              alert.deliveredAt || alert.triggeredAt || new Date().toISOString()
                            )}
                          </TableCell>
                          <TableCell>
                            {alert.failureReason && (
                              <span className="text-xs text-destructive">
                                {alert.failureReason}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {alerts.length > 0
                      ? (
                          ((alerts.filter((a) => a.status === 'delivered').length /
                            alerts.length) *
                            100).toFixed(1) + '%'
                        )
                      : '0%'}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter((a) => a.status === 'failed').length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <footer className="text-center text-sm text-muted-foreground py-8">
          <p>&copy; {new Date().getFullYear()} The Solana Sentinel. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
