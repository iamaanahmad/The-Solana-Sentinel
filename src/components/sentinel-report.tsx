'use client';

import type { SentinelReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreDisplay } from './score-display';
import { Bot, BarChart4, Smile, BadgeCheck, BadgeAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function SentinelReport({ report }: { report: SentinelReportData }) {
  const { sentinelScore, tokenName, tokenSymbol, aiAnalysis, onChainAnalysis, sentimentAnalysis, tokenAddress } = report;

  const riskLevel = aiAnalysis.riskLevel;

  const getRiskColorClass = (risk: 'Low' | 'Medium' | 'High') => ({
    Low: 'text-risk-low',
    Medium: 'text-risk-medium',
    High: 'text-risk-high',
  }[risk]);

  const MetricRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="text-sm font-semibold text-right">{children}</div>
    </div>
  );

  return (
    <Card className="shadow-lg animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Sentinel Report: {tokenName} ({tokenSymbol})</CardTitle>
            <CardDescription className="font-mono text-sm break-all">{tokenAddress}</CardDescription>
          </div>
          <Badge 
            className={cn(
              'text-base font-bold uppercase tracking-wider border-2 px-4 py-1.5', 
              riskLevel === 'Low' && 'bg-risk-low/10 border-risk-low text-risk-low',
              riskLevel === 'Medium' && 'bg-risk-medium/10 border-risk-medium text-risk-medium',
              riskLevel === 'High' && 'bg-risk-high/10 border-risk-high text-risk-high'
            )}
            variant="outline"
          >
            {riskLevel} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-card-foreground/5 p-6 rounded-lg">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary"><BarChart4 />On-Chain Forensics</h3>
                <Separator />
                 <MetricRow label="Mint Authority">
                    {onChainAnalysis.mintAuthorityRenounced ? (
                      <div className="flex items-center gap-2 text-risk-low"><BadgeCheck className="h-4 w-4" /> <span>Renounced</span></div>
                    ) : (
                      <div className="flex items-center gap-2 text-risk-high"><BadgeAlert className="h-4 w-4" /> <span>Active</span></div>
                    )}
                 </MetricRow>
                 <Separator />
                 <MetricRow label="Freeze Authority">
                    {onChainAnalysis.freezeAuthorityRenounced ? (
                       <div className="flex items-center gap-2 text-risk-low"><BadgeCheck className="h-4 w-4" /> <span>Renounced</span></div>
                    ) : (
                       <div className="flex items-center gap-2 text-risk-high"><BadgeAlert className="h-4 w-4" /> <span>Active</span></div>
                    )}
                  </MetricRow>
                  <Separator />
                   <MetricRow label="Top 10 Holder Concentration">
                      <div className="flex items-center gap-3">
                          <span>{`${onChainAnalysis.top10HolderConcentrationPercent.toFixed(1)}%`}</span>
                          <Badge variant="outline" className={cn(getRiskColorClass(aiAnalysis.onChainRisk.holderConcentrationRisk), 'border-current font-semibold')}>{aiAnalysis.onChainRisk.holderConcentrationRisk}</Badge>
                      </div>
                   </MetricRow>
                   <Separator />
                  <MetricRow label="Deployer LP Holdings">
                       <div className="flex items-center gap-3">
                          <span>{`${onChainAnalysis.deployerLpConcentrationPercent.toFixed(1)}%`}</span>
                          <Badge variant="outline" className={cn(getRiskColorClass(aiAnalysis.onChainRisk.deployerLpHoldingsRisk), 'border-current font-semibold')}>{aiAnalysis.onChainRisk.deployerLpHoldingsRisk}</Badge>
                      </div>
                  </MetricRow>
            </div>
             <div className="space-y-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary"><Smile />AI Sentiment Analysis</h3>
                <Separator />
                 <MetricRow label="Community Sentiment">
                   <span>{sentimentAnalysis.humanReadableSummary}</span>
                 </MetricRow>
                 <Separator />
                 <MetricRow label="Sentiment Score">
                    <span>{sentimentAnalysis.compoundScore.toFixed(2)}</span>
                 </MetricRow>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
