'use client';

import { Button } from "@/components/ui/button";

interface ExampleTokensProps {
  setTokenAddress: (address: string) => void;
}

const exampleTokens = [
  { symbol: 'JUP', address: 'JUPyiwrYFCzaZinsc2xbebxCiifD95UqLhgChfJpSA' },
  { symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzL7M6bMktdBCe' },
  { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' }
];

export function ExampleTokens({ setTokenAddress }: ExampleTokensProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <p className="text-sm text-muted-foreground mr-2">Try an example:</p>
      {exampleTokens.map((token) => (
        <Button
          key={token.symbol}
          variant="outline"
          size="sm"
          onClick={() => setTokenAddress(token.address)}
          className="font-mono"
        >
          {token.symbol}
        </Button>
      ))}
    </div>
  );
}
