'use client';

import { useActionState, useEffect, useState } from 'react';
import { analyzeToken, type FormState } from './actions';
import { TokenForm } from '@/components/token-form';
import { SentinelReport } from '@/components/sentinel-report';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, TrendingUp, Shield, Zap, Link as LinkIcon, Sparkles, Info } from 'lucide-react';
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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-8">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/10 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="w-full max-w-6xl space-y-12 relative">
        <header className="text-center space-y-4">
          <Logo />
          <p className="text-muted-foreground md:text-xl max-w-2xl mx-auto leading-relaxed">
            Your AI-powered shield against risky tokens on the Solana blockchain.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Powered by x402 Protocol • Switchboard Oracle • AI Analysis</span>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" role="region" aria-label="Dashboard Statistics">
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
        <nav className="flex gap-4 justify-center flex-wrap mb-8" aria-label="Quick Actions">
          <Button asChild variant="default" size="lg" className="group">
            <a href="/subscriptions">
              <Shield className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Manage Subscriptions
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="group">
            <a href="/history">
              <TrendingUp className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              View History
            </a>
          </Button>
        </nav>

        <main role="main" aria-label="Token Analysis">
          <Card className="shadow-2xl border-2 backdrop-blur-sm bg-card/95">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Analyze Token Risk
              </CardTitle>
              <CardDescription>
                Enter a Solana token address to receive comprehensive risk analysis powered by AI and on-chain data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form action={formAction}>
                <TokenForm />
              </form>
            </CardContent>
          </Card>

          {state.report ? (
            <div className="mt-12 mb-8 animate-in fade-in duration-500">
              <SentinelReport report={state.report} />
            </div>
          ) : (
             !state.error && (
              <div className="mt-12 mb-8">
                 <Alert className="border-2 border-accent/50 bg-accent/5">
                  <Info className="h-4 w-4 text-accent" />
                  <AlertTitle className="text-accent">How It Works</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>Enter a Solana token address above to begin your analysis.</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      <li>On-chain forensics: authority status, holder concentration, liquidity</li>
                      <li>AI sentiment analysis: social media and community sentiment</li>
                      <li>Real-time Switchboard Oracle price feeds</li>
                      <li>Comprehensive risk scoring and recommendations</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )
          )}
        </main>
        <footer className="text-center text-sm text-muted-foreground pt-8" role="contentinfo">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="font-semibold">The Solana Sentinel</span>
          </div>
          <p>&copy; {new Date().getFullYear()} All rights reserved. Built for x402 Hackathon.</p>
        </footer>
      </div>
    </div>
  );
}
