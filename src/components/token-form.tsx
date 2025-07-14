'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface TokenFormProps {
  tokenAddress: string;
  setTokenAddress: (address: string) => void;
}

export function TokenForm({ tokenAddress, setTokenAddress }: TokenFormProps) {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Input
        name="tokenAddress"
        type="text"
        placeholder="Enter a Solana Token Mint Address (e.g., JUP...)"
        required
        disabled={pending}
        className="flex-grow text-base"
        aria-label="Solana Token Address"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
        {pending ? (
          <>
            <Loader2 className="animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Search />
            Analyze
          </>
        )}
      </Button>
    </div>
  );
}
