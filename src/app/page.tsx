'use client';

import { useActionState, useEffect, useState } from 'react';
import { analyzeToken, type FormState } from './actions';
import { TokenForm } from '@/components/token-form';
import { SentinelReport } from '@/components/sentinel-report';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, TrendingUp, Shield, Zap, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/metric-card';

const initialState: FormState = {
  report: null,
  error: null,
};

export default function Home() {
  const [state, formAction] = useActionState(analyzeToken, initialState);
  const { toast } = useToast();
  const [stats, setStats] = useState({ subscriptions: 0, alerts: 0, balance: 250.50 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          // Mock stats for now - in production, fetch from API
          setStats({ subscriptions: 3, alerts: 12, balance: 250.50 });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center space-y-2">
          <Logo />
          <p className="text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Your AI-powered shield against risky tokens on the Solana blockchain.
          </p>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Active Subscriptions"
            value={stats.subscriptions}
            description="Tokens being monitored"
            status={stats.subscriptions > 0 ? 'success' : 'neutral'}
            icon={<Shield className="h-5 w-5" />}
          />
          <MetricCard
            title="Alerts This Week"
            value={stats.alerts}
            description="Price anomalies detected"
            status={stats.alerts > 5 ? 'warning' : 'success'}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Account Balance"
            value={`$${stats.balance.toFixed(2)}`}
            description="USDC available"
            status={stats.balance > 50 ? 'success' : 'warning'}
            icon={<Zap className="h-5 w-5" />}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild variant="default" size="lg">
            <a href="/subscriptions">Manage Subscriptions</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/history">View History</a>
          </Button>
        </div>

        <main>
          <Card className="shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <form action={formAction}>
                <TokenForm />
              </form>
            </CardContent>
          </Card>

          {state.report ? (
            <div className="mt-8 animate-in fade-in duration-500">
              <SentinelReport report={state.report} />
            </div>
          ) : (
             !state.error && (
              <div className="mt-8">
                 <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Welcome to The Sentinel</AlertTitle>
                  <AlertDescription>
                    Enter a Solana token address above to begin your analysis. Our AI will assess on-chain data and social sentiment to generate a comprehensive risk report.
                  </AlertDescription>
                </Alert>
              </div>
            )
          )}
        </main>
        <footer className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} The Solana Sentinel. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
