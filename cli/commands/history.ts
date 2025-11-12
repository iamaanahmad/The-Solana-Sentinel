import { Command } from 'commander';
import { BaseCommand } from '../base-command';
import chalk from 'chalk';

export class HistoryCommand extends BaseCommand {
  setup(): void {
    const command = new Command('history')
      .description('View alert history and activity logs')
      .option(
        '-p, --pubkey <address>',
        'Agent public key (optional)'
      )
      .option(
        '-l, --limit <number>',
        'Number of alerts to show',
        '10'
      )
      .option(
        '-f, --filter <type>',
        'Filter by type (all|triggered|failed)'
      )
      .option(
        '-j, --json',
        'Output as JSON',
        false
      )
      .action((options) => this.execute(options));

    this.program.addCommand(command);
  }

  private async execute(options: {
    pubkey?: string;
    limit?: string;
    filter?: string;
    json?: boolean;
  }) {
    try {
      const limit = parseInt(options.limit || '10');
      const filter = options.filter || 'all';

      this.info(`Fetching alert history (limit: ${limit}, filter: ${filter})...`);

      // Mock history data
      const history = {
        total: 47,
        alerts: this.getMockAlerts(limit, filter),
        summary: {
          totalTriggered: 47,
          successfulAlerts: 45,
          failedAlerts: 2,
          averageResponseTime: '0.23s',
          period: 'Last 30 days',
        },
      };

      if (options.json) {
        console.log(JSON.stringify(history, null, 2));
      } else {
        this.displayHistory(history);
        this.success('History fetched successfully');
      }
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'Failed to fetch history'
      );
      process.exit(1);
    }
  }

  private getMockAlerts(limit: number, filter: string) {
    const alerts = [
      {
        id: 'alert-001',
        tokenAddress: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
        symbol: 'USDC',
        riskScore: 82,
        priceChange: 8.5,
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 10000).toISOString(),
        subscriptionId: 'sub-001',
      },
      {
        id: 'alert-002',
        tokenAddress: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        riskScore: 95,
        priceChange: 12.3,
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 45000).toISOString(),
        subscriptionId: 'sub-002',
      },
      {
        id: 'alert-003',
        tokenAddress: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
        symbol: 'USDC',
        riskScore: 45,
        priceChange: 2.1,
        status: 'pending',
        triggedAt: new Date(Date.now() - 300000).toISOString(),
        subscriptionId: 'sub-001',
      },
      {
        id: 'alert-004',
        tokenAddress: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        riskScore: 88,
        priceChange: 11.2,
        status: 'failed',
        failureReason: 'Webhook timeout',
        triggeredAt: new Date(Date.now() - 3600000).toISOString(),
        subscriptionId: 'sub-002',
      },
      {
        id: 'alert-005',
        tokenAddress: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
        symbol: 'USDC',
        riskScore: 72,
        priceChange: 5.8,
        status: 'delivered',
        deliveredAt: new Date(Date.now() - 7200000).toISOString(),
        subscriptionId: 'sub-001',
      },
    ];

    return alerts
      .filter((alert) => {
        if (filter === 'triggered') return alert.status !== 'pending';
        if (filter === 'failed') return alert.status === 'failed';
        return true;
      })
      .slice(0, limit);
  }

  private displayHistory(data: any) {
    console.log();
    console.log(chalk.bold(`📜 Alert History`));
    console.log(chalk.gray('═'.repeat(80)));

    // Summary Stats
    console.log(chalk.cyan('\n📊 Summary Statistics'));
    console.log(
      `  Period: ${data.summary.period}`
    );
    console.log(
      `  Total alerts: ${chalk.bold(data.summary.totalTriggered)}`
    );
    console.log(
      `  Successful: ${chalk.green(data.summary.successfulAlerts)} | Failed: ${chalk.red(data.summary.failedAlerts)}`
    );
    console.log(
      `  Success rate: ${chalk.green((((data.summary.successfulAlerts / data.summary.totalTriggered) * 100).toFixed(1)) + '%')}`
    );

    // Alert List
    console.log(chalk.cyan('\n🔔 Recent Alerts'));
    console.log(
      chalk.gray(
        '  ID          | Token  | Risk | Change | Status    | Time'
      )
    );
    console.log(chalk.gray('  ' + '─'.repeat(76)));

    data.alerts.forEach((alert: any) => {
      const statusColor =
        alert.status === 'delivered'
          ? 'green'
          : alert.status === 'failed'
            ? 'red'
            : 'yellow';
      const changeColor = alert.priceChange > 0 ? 'green' : 'red';

      const timeAgo = this.getTimeAgo(
        new Date(alert.deliveredAt || alert.triggeredAt)
      );

      console.log(
        `  ${alert.id.padEnd(11)} | ${alert.symbol.padEnd(6)} | ${String(alert.riskScore).padEnd(4)} | ${chalk[changeColor](
          (alert.priceChange > 0 ? '+' : '') + alert.priceChange.toFixed(1) + '%'
        ).padEnd(7)} | ${chalk[statusColor](alert.status.padEnd(9))} | ${timeAgo}`
      );

      if (alert.failureReason) {
        console.log(
          chalk.red(`    └─ Failure: ${alert.failureReason}`)
        );
      }
    });

    console.log(chalk.gray('\n' + '═'.repeat(80)));
    console.log(chalk.dim('\nUse `sentinel status` to check active subscriptions'));
  }

  private getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

export default HistoryCommand;
