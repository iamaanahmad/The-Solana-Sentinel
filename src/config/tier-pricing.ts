import type { X402Tier } from '@/types/x402';

export type TierConfig = {
  name: string;
  priceUsdc: number;
  description: string;
  features: string[];
  cacheTtlSeconds?: number;
};

export const TIER_PRICING: Record<X402Tier, TierConfig> = {
  basic: {
    name: 'Basic',
    priceUsdc: 0,
    description: 'Score + high-level risk category',
    features: ['Sentinel Score', 'Risk Level'],
    cacheTtlSeconds: 300,
  },
  standard: {
    name: 'Standard',
    priceUsdc: 0.1,
    description: 'Full risk report with sentiment + on-chain metrics',
    features: ['Full Risk Report', 'Sentiment Analysis', 'On-chain Metrics'],
  },
  premium: {
    name: 'Premium',
    priceUsdc: 0.5,
    description: 'Switchboard data, signed attestation & storage',
    features: ['Switchboard Oracle Data', 'Signed Attestation', 'Historical Trend Snapshot'],
  },
};

export function assertTier(tier: string | undefined | null): X402Tier {
  if (tier === 'basic' || tier === 'standard' || tier === 'premium') {
    return tier;
  }
  throw new Error(`Unsupported analysis tier: ${tier ?? 'undefined'}`);
}

export function getTierConfig(tier: X402Tier): TierConfig {
  return TIER_PRICING[tier];
}
