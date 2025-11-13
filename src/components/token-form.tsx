'use client';

import { useFormStatus } from 'react-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Loader2, Info, Zap, Shield, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="w-full sm:w-auto min-w-[140px] group" 
      size="lg"
      aria-live="polite"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Search className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
          <span>Analyze Token</span>
        </>
      )}
    </Button>
  );
}

export function TokenForm() {
  const [selectedTier, setSelectedTier] = useState('basic');

  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      icon: Shield,
      color: 'text-blue-500',
      borderColor: 'border-blue-500/50',
      bgColor: 'bg-blue-500/5',
      features: ['On-chain analysis', 'Basic sentiment']
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$0.10 USDC',
      icon: Zap,
      color: 'text-purple-500',
      borderColor: 'border-purple-500/50',
      bgColor: 'bg-purple-500/5',
      features: ['Everything in Basic', 'AI-powered insights', 'Full sentiment analysis']
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$0.50 USDC',
      icon: Crown,
      color: 'text-amber-500',
      borderColor: 'border-amber-500/50',
      bgColor: 'bg-amber-500/5',
      features: ['Everything in Standard', 'Switchboard Oracle data', 'Real-time alerts', 'Priority analysis']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Token Address Input */}
      <div className="space-y-2">
        <Label htmlFor="tokenAddress" className="text-base font-semibold">
          Token Address
        </Label>
        <Input
          id="tokenAddress"
          name="tokenAddress"
          type="text"
          placeholder="e.g., So11111111111111111111111111111111111111112"
          required
          className="text-base h-12 font-mono"
          aria-label="Solana Token Address"
          aria-required="true"
          aria-describedby="token-address-description"
        />
        <p id="token-address-description" className="text-sm text-muted-foreground">
          Enter the Solana token mint address (44 characters)
        </p>
      </div>

      {/* Tier Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Info className="h-4 w-4" aria-hidden="true" />
          Select Analysis Tier
        </Label>
        
        <RadioGroup 
          defaultValue="basic" 
          name="tier"
          value={selectedTier}
          onValueChange={setSelectedTier}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          aria-label="Analysis tier selection"
        >
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isSelected = selectedTier === tier.id;
            
            return (
              <div key={tier.id} className="relative">
                <RadioGroupItem
                  value={tier.id}
                  id={tier.id}
                  className="peer sr-only"
                  aria-describedby={`${tier.id}-description`}
                />
                <Label
                  htmlFor={tier.id}
                  className={cn(
                    "flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:scale-[1.02]",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                    isSelected 
                      ? `${tier.borderColor} ${tier.bgColor} shadow-md` 
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", isSelected ? tier.color : "text-muted-foreground")} aria-hidden="true" />
                      <span className="font-semibold">{tier.name}</span>
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      isSelected ? tier.color : "text-muted-foreground"
                    )}>
                      {tier.price}
                    </span>
                  </div>
                  <ul 
                    id={`${tier.id}-description`}
                    className="text-xs text-muted-foreground space-y-1"
                  >
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <SubmitButton />
      </div>
    </div>
  );
}
