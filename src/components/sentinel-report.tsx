'use client';

import type { SentinelReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreDisplay } from './score-display';
import { Bot, BarChart4, Smile, BadgeCheck, BadgeAlert, Copy, ExternalLink, TrendingUp, Link2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

export function SentinelReport({ report }: { report: SentinelReportData }) {
  const { sentinelScore, tokenName, tokenSymbol, aiAnalysis, onChainAnalysis, sentimentAnalysis, tokenAddress } = report;
  const [copied, setCopied] = useState(false);

  const riskLevel = aiAnalysis.riskLevel;
  const riskColorClass = {
    Low: 'text-green-500 border-green-500 bg-green-500/10',
    Medium: 'text-amber-500 border-amber-500 bg-amber-500/10',
    High: 'text-red-500 border-red-500 bg-red-500/10',
  }[riskLevel];

  const getRiskColorClass = (risk: 'Low' | 'Medium' | 'High') => ({
    Low: 'text-green-500',
    Medium: 'text-amber-500',
    High: 'text-red-500',
  }[risk]);
  
  const getRiskBadgeClass = (risk: 'Low' | 'Medium' | 'High') => ({
    Low: 'border-green-500 bg-green-500/10 text-green-500',
    Medium: 'border-amber-500 bg-amber-500/10 text-amber-500',
    High: 'border-red-500 bg-red-500/10 text-red-500',
  }[risk]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-2xl border-2 backdrop-blur-sm bg-card/95 animate-in fade-in duration-500" role="region" aria-label="Token Analysis Report">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
              <span>{tokenName}</span>
              <span className="text-muted-foreground">({tokenSymbol})</span>
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <CardDescription className="font-mono text-xs md:text-sm break-all" aria-label="Token Address">
                {tokenAddress}
              </CardDescription>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="h-6 px-2"
                aria-label="Copy token address"
              >
                <Copy className="h-3 w-3" />
                {copied && <span className="ml-1 text-xs">Copied!</span>}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild
                className="h-6 px-2"
              >
                <a 
                  href={`https://solscan.io/token/${tokenAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="View on Solscan"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="ml-1 text-xs">Solscan</span>
                </a>
              </Button>
            </div>
          </div>
          <Badge 
            className={cn(
              "text-base md:text-lg font-bold uppercase tracking-wider px-4 py-2 border-2 whitespace-nowrap",
              riskColorClass
            )}
            aria-label={`Risk level: ${riskLevel}`}
          >
            {riskLevel} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-10">
        
        {/* Score and Verdict Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center bg-gradient-to-br from-muted/30 to-muted/10 p-8 md:p-10 rounded-xl border-2 mb-4">
          <div className="lg:col-span-1 flex justify-center">
            <ScoreDisplay score={sentinelScore} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <h3 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-primary">
              <Bot className="h-6 w-6" aria-hidden="true" />
              AI Analysis Verdict
            </h3>
            <p className="text-foreground/90 leading-relaxed text-base md:text-lg">
              {aiAnalysis.finalVerdict}
            </p>
          </div>
        </div>

        {/* On-Chain and Sentiment Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* On-Chain Forensics */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-primary border-b pb-3 mt-2">
              <BarChart4 className="h-5 w-5" aria-hidden="true" />
              On-Chain Forensics
            </h3>
            <div className="space-y-5">
              {/* Mint Authority */}
              <div className="space-y-2 p-5 rounded-lg bg-muted/30 border">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Mint Authority</p>
                  {onChainAnalysis.mintAuthorityRenounced ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      <span className="font-semibold">Renounced</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <BadgeAlert className="h-4 w-4" aria-hidden="true" />
                      <span className="font-semibold">Active</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {onChainAnalysis.mintAuthorityRenounced 
                    ? "Supply is fixed and cannot be increased" 
                    : "Supply can be increased by mint authority"}
                </p>
              </div>

              {/* Freeze Authority */}
              <div className="space-y-2 p-5 rounded-lg bg-muted/30 border">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Freeze Authority</p>
                  {onChainAnalysis.freezeAuthorityRenounced ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      <span className="font-semibold">Renounced</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <BadgeAlert className="h-4 w-4" aria-hidden="true" />
                      <span className="font-semibold">Active</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {onChainAnalysis.freezeAuthorityRenounced 
                    ? "Accounts cannot be frozen" 
                    : "Accounts can be frozen by authority"}
                </p>
              </div>

              {/* Holder Concentration */}
              <div className="space-y-2 p-5 rounded-lg bg-muted/30 border">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Top 10 Holders</p>
                  <Badge 
                    variant="outline" 
                    className={cn(getRiskBadgeClass(aiAnalysis.onChainRisk.holderConcentrationRisk), 'border-2')}
                  >
                    {aiAnalysis.onChainRisk.holderConcentrationRisk} Risk
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concentration</span>
                    <span className="font-semibold">{onChainAnalysis.top10HolderConcentrationPercent.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={onChainAnalysis.top10HolderConcentrationPercent} 
                    className="h-2"
                    aria-label={`Holder concentration: ${onChainAnalysis.top10HolderConcentrationPercent.toFixed(1)}%`}
                  />
                </div>
              </div>

              {/* Deployer LP Holdings */}
              <div className="space-y-2 p-5 rounded-lg bg-muted/30 border">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Deployer LP Holdings</p>
                  <Badge 
                    variant="outline" 
                    className={cn(getRiskBadgeClass(aiAnalysis.onChainRisk.deployerLpHoldingsRisk), 'border-2')}
                  >
                    {aiAnalysis.onChainRisk.deployerLpHoldingsRisk} Risk
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">LP Control</span>
                    <span className="font-semibold">{onChainAnalysis.deployerLpConcentrationPercent.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={onChainAnalysis.deployerLpConcentrationPercent} 
                    className="h-2"
                    aria-label={`Deployer LP holdings: ${onChainAnalysis.deployerLpConcentrationPercent.toFixed(1)}%`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-3 text-primary border-b pb-3 mt-2">
              <Smile className="h-5 w-5" aria-hidden="true" />
              Community Sentiment
            </h3>
            <div className="space-y-5">
              {/* Sentiment Summary */}
              <div className="p-7 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-purple-500" aria-hidden="true" />
                  <h4 className="font-semibold text-lg">Overall Sentiment</h4>
                </div>
                <p className="text-2xl font-bold text-purple-500 mb-2">
                  {sentimentAnalysis.humanReadableSummary}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compound Score</span>
                    <span className="font-semibold">{sentimentAnalysis.compoundScore.toFixed(2)}</span>
                  </div>
                  <Progress 
                    value={(sentimentAnalysis.compoundScore + 1) * 50} 
                    className="h-2"
                    aria-label={`Sentiment score: ${sentimentAnalysis.compoundScore.toFixed(2)}`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Analyzed from social media and community discussions
                  </p>
                </div>
              </div>

              {/* Additional Metrics Placeholder */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border text-center">
                  <p className="text-2xl font-bold text-primary mb-1">--</p>
                  <p className="text-xs text-muted-foreground">Social Mentions</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border text-center">
                  <p className="text-2xl font-bold text-primary mb-1">--</p>
                  <p className="text-xs text-muted-foreground">Sentiment Trend</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* On-Chain Attestation Section (Premium only) */}
        {report.onChainAttestation && (
          <div className="p-7 md:p-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-primary animate-pulse" aria-hidden="true" />
              <h3 className="text-xl font-bold text-primary">On-Chain Attestation</h3>
              <Badge variant="outline" className="ml-auto border-primary text-primary">
                Premium Verified
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Transaction Signature</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-muted/50 px-3 py-2 rounded border flex-1 overflow-hidden text-ellipsis">
                    {report.onChainAttestation.signature.slice(0, 16)}...{report.onChainAttestation.signature.slice(-16)}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="h-8 px-2"
                  >
                    <a 
                      href={report.onChainAttestation.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label="View transaction on Solana Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Attestation Account</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-muted/50 px-3 py-2 rounded border flex-1 overflow-hidden text-ellipsis">
                    {report.onChainAttestation.attestationPda.slice(0, 16)}...{report.onChainAttestation.attestationPda.slice(-16)}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={async () => {
                      await navigator.clipboard.writeText(report.onChainAttestation!.attestationPda);
                    }}
                    className="h-8 px-2"
                    aria-label="Copy attestation PDA"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Block Slot</p>
                <p className="font-mono font-semibold">{report.onChainAttestation.slot.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Block Time</p>
                <p className="font-mono font-semibold">
                  {report.onChainAttestation.blockTime 
                    ? new Date(report.onChainAttestation.blockTime * 1000).toLocaleTimeString()
                    : 'Pending'
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Network</p>
                <Badge variant="outline" className="border-primary text-primary">
                  {process.env.NEXT_PUBLIC_NETWORK || 'devnet'}
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Link2 className="h-3 w-3" />
                This analysis has been cryptographically attested and stored on the Solana blockchain for permanent verification.
              </p>
            </div>
          </div>
        )}

        {/* Attestation Metadata Section (Standard tier) */}
        {report.attestation && !report.onChainAttestation && (
          <div className="p-6 rounded-lg bg-muted/30 border space-y-3">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-green-500" />
              <p className="text-sm font-semibold">Cryptographically Verified</p>
            </div>
            <p className="text-xs text-muted-foreground">
              This report is signed with Ed25519 cryptographic signature. Upgrade to Premium for on-chain storage.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
