import { Command } from 'commander';
import { BaseCommand } from '../base-command';
import chalk from 'chalk';

export class AnalyzeCommand extends BaseCommand {
  setup(): void {
    const command = new Command('analyze')
      .description('Perform token sentiment analysis and risk assessment')
      .argument('<token-address>', 'Solana token mint address')
      .option(
        '-f, --full',
        'Show full analysis report with charts',
        false
      )
      .option(
        '-j, --json',
        'Output as JSON for integration',
        false
      )
      .action((tokenAddress, options) => this.execute(tokenAddress, options));

    this.program.addCommand(command);
  }

  private async execute(
    tokenAddress: string,
    options: { full?: boolean; json?: boolean }
  ) {
    try {
      this.info(`Analyzing token: ${tokenAddress}`);

      // Validate token address
      if (tokenAddress.length < 32) {
        throw new Error('Invalid Solana token address');
      }

      // Mock analysis data (in production, this would call the ML API)
      const analysis = {
        tokenAddress,
        symbol: 'TOKEN',
        name: 'Test Token',
        timestamp: new Date().toISOString(),
        sentiment: {
          score: 0.73,
          label: 'Positive',
          confidence: 0.89,
          drivers: [
            'Strong development activity',
            'Increasing market interest',
            'Positive social sentiment',
          ],
        },
        risks: {
          riskScore: 42,
          level: 'Medium',
          factors: [
            {
              category: 'Volatility',
              score: 65,
              description: 'High price volatility detected',
            },
            {
              category: 'Liquidity',
              score: 38,
              description: 'Adequate liquidity on major exchanges',
            },
            {
              category: 'Holder Distribution',
              score: 52,
              description: 'Moderately distributed token holders',
            },
            {
              category: 'Contract Safety',
              score: 22,
              description: 'Contract verified and audited',
            },
          ],
        },
        marketData: {
          priceUsd: 1.234,
          priceChange24h: 5.67,
          priceChange7d: -2.34,
          marketCap: 123456789,
          volume24h: 56789000,
          holders: 12345,
        },
        alerts: {
          active: 3,
          triggered24h: 1,
          recentAlerts: [
            {
              type: 'Price Volatility',
              severity: 'warning',
              message: '8% price swing detected in last hour',
              timestamp: new Date().toISOString(),
            },
          ],
        },
      };

      if (options.json) {
        console.log(JSON.stringify(analysis, null, 2));
      } else {
        this.displayAnalysis(analysis, options.full ?? false);
        this.success('Analysis complete');
      }
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'Analysis failed'
      );
      process.exit(1);
    }
  }

  private displayAnalysis(analysis: any, full: boolean) {
    console.log();
    console.log(chalk.bold(`📊 Token Analysis Report`));
    console.log(chalk.gray('═'.repeat(60)));

    // Basic Info
    console.log(chalk.cyan('\n📋 Token Information'));
    console.log(`  Name: ${analysis.name} (${analysis.symbol})`);
    console.log(`  Address: ${analysis.tokenAddress}`);
    console.log(`  Price: $${analysis.marketData.priceUsd.toFixed(4)}`);
    console.log(
      `  24h Change: ${analysis.marketData.priceChange24h > 0 ? '📈' : '📉'} ${analysis.marketData.priceChange24h.toFixed(2)}%`
    );

    // Sentiment
    console.log(chalk.cyan('\n💭 Market Sentiment'));
    const sentimentColor =
      analysis.sentiment.score > 0.7
        ? 'green'
        : analysis.sentiment.score > 0.4
          ? 'yellow'
          : 'red';
    console.log(
      `  Score: ${chalk[sentimentColor](analysis.sentiment.score.toFixed(2))} (${analysis.sentiment.label})`
    );
    console.log(`  Confidence: ${(analysis.sentiment.confidence * 100).toFixed(0)}%`);

    // Risk Assessment
    console.log(chalk.cyan('\n⚠️  Risk Assessment'));
    const riskColor =
      analysis.risks.riskScore < 40
        ? 'green'
        : analysis.risks.riskScore < 70
          ? 'yellow'
          : 'red';
    console.log(
      `  Risk Score: ${chalk[riskColor](analysis.risks.riskScore)} (${analysis.risks.level})`
    );

    if (full) {
      console.log(chalk.cyan('\n📈 Risk Factors'));
      analysis.risks.factors.forEach((factor: any) => {
        const factorColor =
          factor.score < 40 ? 'green' : factor.score < 70 ? 'yellow' : 'red';
        console.log(
          `  • ${factor.category}: ${chalk[factorColor](factor.score)} - ${factor.description}`
        );
      });

      console.log(chalk.cyan('\n📊 Market Data'));
      console.log(
        `  Market Cap: $${(analysis.marketData.marketCap / 1e6).toFixed(1)}M`
      );
      console.log(
        `  24h Volume: $${(analysis.marketData.volume24h / 1e6).toFixed(1)}M`
      );
      console.log(`  Holders: ${analysis.marketData.holders.toLocaleString()}`);

      if (analysis.alerts.recentAlerts.length > 0) {
        console.log(chalk.cyan('\n🔔 Recent Alerts'));
        analysis.alerts.recentAlerts.forEach((alert: any) => {
          const severityColor =
            alert.severity === 'critical'
              ? 'red'
              : alert.severity === 'warning'
                ? 'yellow'
                : 'blue';
          console.log(
            `  • ${chalk[severityColor](alert.type)}: ${alert.message}`
          );
        });
      }
    }

    console.log(chalk.gray('\n' + '═'.repeat(60)));
  }
}

export default AnalyzeCommand;
