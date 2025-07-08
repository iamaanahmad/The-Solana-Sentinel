'use client';

import type { SentinelReportData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScoreDisplay } from './score-display';
import { Separator } from './ui/separator';
import { Bot, BarChart4, Smile, Droplets, ShieldCheck, Snowflake, Users, Landmark } from 'lucide-react';
import { MetricCard } from './metric-card';

export function SentinelReport({ report }: { report: SentinelReportData }) {
  
  const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score < 40) return 'high';
    if (score < 70) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel(report.sentinelScore);
  const riskColorClass = {
    low: 'text-risk-low',
    medium: 'text-risk-medium',
    high: 'text-risk-high',
  }[riskLevel];

  const getSentimentIcon = (disposition: string) => {
    switch (disposition) {
      case 'Positive': return <Smile className="text-risk-low" />;
      case 'Negative': return <Smile className="text-risk-high" />;
      default: return <Smile className="text-muted-foreground" />;
    }
  }

  return (
    <Card className="shadow-lg animate-in fade-in duration-500">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <CardTitle className="text-2xl">Sentinel Report</CardTitle>
                <CardDescription className="font-mono text-sm break-all">{report.tokenAddress}</CardDescription>
            </div>
             <div className={`text-lg font-bold uppercase tracking-wider px-3 py-1 rounded-full ${riskColorClass} border-2 border-current`}>
                Risk Level: {riskLevel}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-muted/50 p-6 rounded-lg">
            <div className="md:col-span-1 flex justify-center">
                 <ScoreDisplay score={report.sentinelScore} />
            </div>
            <div className="md:col-span-2 space-y-3">
                 <h3 className="flex items-center gap-2 text-xl font-semibold text-primary">
                    <Bot />
                    AI-Powered Insights
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                    {report.aiSummary}
                </p>
            </div>
        </div>

        <Separator />
        
        <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary"><BarChart4 />On-Chain Forensics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard 
                    title="Mint Authority"
                    value={report.onChainAnalysis.mintAuthorityRenounced ? 'Renounced' : 'Active'}
                    status={report.onChainAnalysis.mintAuthorityRenounced ? 'success' : 'danger'}
                    description="Ability to create new tokens."
                    icon={<ShieldCheck />}
                />
                <MetricCard 
                    title="Freeze Authority"
                    value={report.onChainAnalysis.freezeAuthorityRenounced ? 'Renounced' : 'Active'}
                    status={report.onChainAnalysis.freezeAuthorityRenounced ? 'success' : 'danger'}
                    description="Ability to freeze token transfers."
                    icon={<Snowflake />}
                />
                <MetricCard 
                    title="Top 10 Holders"
                    value={`${report.onChainAnalysis.top10HolderPercentage.toFixed(2)}%`}
                    status={report.onChainAnalysis.top10HolderPercentage > 20 ? 'warning' : 'success'}
                    description="Ownership concentration risk."
                    icon={<Users />}
                />
                 <MetricCard 
                    title="Total Liquidity"
                    value={`$${report.onChainAnalysis.liquidity.totalValue.toLocaleString()}`}
                    status={report.onChainAnalysis.liquidity.isLocked ? 'success' : 'warning'}
                    description={report.onChainAnalysis.liquidity.isLocked ? 'Pool is locked.' : 'Pool is unlocked.'}
                    icon={<Droplets />}
                />
                <MetricCard 
                    title="Deployer Liquidity"
                    value={`${report.onChainAnalysis.liquidity.deployerLpPercentage.toFixed(2)}%`}
                    status={report.onChainAnalysis.liquidity.deployerLpPercentage > 10 ? 'warning' : 'success'}
                    description="Portion of LP held by deployer."
                    icon={<Landmark />}
                />
            </div>
        </div>
        
        <Separator />

         <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary"><Smile />Sentiment Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 <MetricCard 
                    title="Social Disposition"
                    value={report.sentimentAnalysis.disposition}
                    status={report.sentimentAnalysis.disposition === 'Positive' ? 'success' : report.sentimentAnalysis.disposition === 'Negative' ? 'danger' : 'neutral'}
                    description="Overall social media sentiment."
                    icon={getSentimentIcon(report.sentimentAnalysis.disposition)}
                />
            </div>
        </div>


      </CardContent>
    </Card>
  );
}
