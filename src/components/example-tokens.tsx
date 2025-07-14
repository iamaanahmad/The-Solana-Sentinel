'use client';

import { Button } from "@/components/ui/button";

interface ExampleTokensProps {
  setTokenAddress: (address: string) => void;
}

const exampleTokens = [
  { symbol: 'PYUSD', address: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo' },
  { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'RAY', address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' }
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
