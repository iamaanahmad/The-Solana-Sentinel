'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export function TokenForm() {
  const { pending } = useFormStatus();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <Input
        name="tokenAddress"
        type="text"
        placeholder="Enter Solana Token Address..."
        required
        disabled={pending}
        className="flex-grow text-base"
        aria-label="Solana Token Address"
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
