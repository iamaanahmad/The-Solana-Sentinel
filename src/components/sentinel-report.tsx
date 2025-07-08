'use client';

import type { SentinelReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreDisplay } from './score-display';
import { Bot, BarChart4, Smile, BadgeCheck, BadgeAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function SentinelReport({ report }: { report: SentinelReportData }) {
  const { sentinelScore, tokenName, tokenSymbol, aiAnalysis, onChainAnalysis, sentimentAnalysis, tokenAddress } = report;

  const riskLevel = aiAnalysis.riskLevel;
  const riskColorClass = {
    Low: 'text-risk-low',
    Medium: 'text-risk-medium',
    High: 'text-risk-high',
  }[riskLevel];

  const getRiskColorClass = (risk: 'Low' | 'Medium' | 'High') => ({
    Low: 'text-risk-low',
    Medium: 'text-risk-medium',
    High: 'text-risk-high',
  }[risk]);

  return (
    <Card className="shadow-lg animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Sentinel Report: {tokenName} ({tokenSymbol})</CardTitle>
            <CardDescription className="font-mono text-sm break-all">{tokenAddress}</CardDescription>
          </div>
          <div className={`text-lg font-bold uppercase tracking-wider px-3 py-1 rounded-full ${riskColorClass} border-2 border-current`}>
            {riskLevel} Risk
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-muted/50 p-6 rounded-lg">
          <div className="md:col-span-1 flex justify-center">
            <ScoreDisplay score={sentinelScore} />
          </div>
          <div className="md:col-span-2 space-y-3">
            <h3 className="flex items-center gap-2 text-xl font-semibold text-primary">
              <Bot />
              Final Verdict
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              {aiAnalysis.finalVerdict}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary"><BarChart4 />On-Chain Forensics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1">
                    <p className="text-sm font-medium">Mint Authority</p>
                    {onChainAnalysis.mintAuthorityRenounced ? (
                      <div className="flex items-center gap-2 text-risk-low"><BadgeCheck className="h-4 w-4" /> <span className="font-semibold">Renounced</span></div>
                    ) : (
                      <div className="flex items-center gap-2 text-risk-high"><BadgeAlert className="h-4 w-4" /> <span className="font-semibold">Active</span></div>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <p className="text-sm font-medium">Freeze Authority</p>
                    {onChainAnalysis.freezeAuthorityRenounced ? (
                       <div className="flex items-center gap-2 text-risk-low"><BadgeCheck className="h-4 w-4" /> <span className="font-semibold">Renounced</span></div>
                    ) : (
                       <div className="flex items-center gap-2 text-risk-high"><BadgeAlert className="h-4 w-4" /> <span className="font-semibold">Active</span></div>
                    )}
                  </div>
                   <div className="flex justify-between items-center py-1">
                      <p className="text-sm font-medium">Top 10 Holder Concentration</p>
                      <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{`${onChainAnalysis.top10HolderConcentrationPercent.toFixed(1)}%`}</span>
                          <Badge variant="outline" className={cn(getRiskColorClass(aiAnalysis.onChainRisk.holderConcentrationRisk), 'border-current')}>{aiAnalysis.onChainRisk.holderConcentrationRisk} Risk</Badge>
                      </div>
                   </div>
                  <div className="flex justify-between items-center py-1">
                      <p className="text-sm font-medium">Deployer LP Holdings</p>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{`${onChainAnalysis.deployerLpConcentrationPercent.toFixed(1)}%`}</span>
                          <Badge variant="outline" className={cn(getRiskColorClass(aiAnalysis.onChainRisk.deployerLpHoldingsRisk), 'border-current')}>{aiAnalysis.onChainRisk.deployerLpHoldingsRisk} Risk</Badge>
                      </div>
                  </div>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary"><Smile />AI Sentiment Analysis</h3>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center py-1">
                       <p className="text-sm font-medium">Community Sentiment</p>
                       <p className="font-semibold text-sm">{sentimentAnalysis.humanReadableSummary}</p>
                    </div>
                     <div className="flex justify-between items-center py-1">
                       <p className="text-sm font-medium">Sentiment Score</p>
                       <p className="font-semibold text-sm">{sentimentAnalysis.compoundScore.toFixed(2)}</p>
                    </div>
                 </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
