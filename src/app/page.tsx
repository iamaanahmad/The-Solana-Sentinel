'use client';

import { useActionState, useEffect } from 'react';
import { analyzeToken, type FormState } from './actions';
import { TokenForm } from '@/components/token-form';
import { SentinelReport } from '@/components/sentinel-report';
import { Logo } from '@/components/logo';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const initialState: FormState = {
  report: null,
  error: null,
};

export default function Home() {
  const [state, formAction] = useActionState(analyzeToken, initialState);
  const { toast } = useToast();

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
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2">
          <Logo />
          <p className="text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Your AI-powered shield against risky tokens on the Solana blockchain.
          </p>
        </header>

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
