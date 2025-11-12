import { Command } from 'commander';
import { BaseCommand } from '../base-command';
import chalk from 'chalk';

export class StatusCommand extends BaseCommand {
  setup(): void {
    const command = new Command('status')
      .description('Check subscription status and monitoring info')
      .option(
        '-p, --pubkey <address>',
        'Agent public key (optional)'
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
    json?: boolean;
  }) {
    try {
      this.info('Fetching subscription status...');

      const pubkey = options.pubkey || 'wallet.solana.local';

      // Mock status data
      const status = {
        agent: {
          pubkey,
          balance: 245.82,
          tier: 'premium',
          status: 'active',
        },
        subscriptions: {
          active: 3,
          paused: 1,
          total: 4,
        },
        monitored: this.getMockMonitored(),
        alerts: {
          lastTriggered: '5 minutes ago',
          thisWeek: 12,
          thisMonth: 47,
        },
        billing: {
          nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          costPerAlert: 0.25,
          estimatedMonthly: 11.75,
          upcomingCharges: 47.00,
        },
        health: {
          webhookStatus: 'healthy',
          lastHealthCheck: '2 minutes ago',
          averageResponseTime: '0.23s',
          successRate: 98.9,
        },
      };

      if (options.json) {
        console.log(JSON.stringify(status, null, 2));
      } else {
        this.displayStatus(status);
        this.success('Status retrieved successfully');
      }
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'Failed to fetch status'
      );
      process.exit(1);
    }
  }

  private getMockMonitored() {
    return [
      {
        symbol: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        price: 142.35,
        priceChange24h: 5.2,
        riskScore: 45,
        status: 'monitored',
        alerts24h: 2,
      },
      {
        symbol: 'USDC',
        address: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
        price: 1.0,
        priceChange24h: 0.1,
        riskScore: 18,
        status: 'monitored',
        alerts24h: 0,
      },
      {
        symbol: 'ORCA',
        address: 'orcaEKTdK7LKz57chysJ34T1R74Vj2M7XCJB3eJ5cS',
        price: 2.45,
        priceChange24h: -8.3,
        riskScore: 72,
        status: 'monitored',
        alerts24h: 5,
      },
    ];
  }

  private displayStatus(data: any) {
    console.log();
    console.log(chalk.bold(`📊 Subscription Status`));
    console.log(chalk.gray('═'.repeat(80)));

    // Agent Info
    console.log(chalk.cyan('\n👤 Agent Information'));
    console.log(`  Pubkey: ${chalk.bold(data.agent.pubkey)}`);
    console.log(
      `  Balance: ${chalk.green(chalk.bold('$' + data.agent.balance))} USDC`
    );
    console.log(
      `  Tier: ${chalk.yellow(data.agent.tier.toUpperCase())}`
    );
    console.log(
      `  Status: ${chalk.green(chalk.bold(data.agent.status))}`
    );

    // Subscription Overview
    console.log(chalk.cyan('\n📋 Subscriptions'));
    console.log(`  Active: ${chalk.green(data.subscriptions.active)}`);
    console.log(`  Paused: ${chalk.yellow(data.subscriptions.paused)}`);
    console.log(`  Total: ${chalk.bold(data.subscriptions.total)}`);

    // Monitored Tokens
    console.log(chalk.cyan('\n🔍 Monitored Tokens'));
    console.log(
      chalk.gray(
        '  Symbol | Price    | 24h Change | Risk | 24h Alerts'
      )
    );
    console.log(chalk.gray('  ' + '─'.repeat(70)));

    data.monitored.forEach((token: any) => {
      const changeColor = token.priceChange24h > 0 ? 'green' : 'red';
      const riskColor =
        token.riskScore < 30
          ? 'green'
          : token.riskScore < 70
            ? 'yellow'
            : 'red';

      console.log(
        `  ${token.symbol.padEnd(6)} | $${String(token.price).padEnd(7)} | ${chalk[changeColor](
          (token.priceChange24h > 0 ? '+' : '') +
            token.priceChange24h.toFixed(1) +
            '%'
        ).padEnd(10)} | ${chalk[riskColor](String(token.riskScore).padEnd(4))} | ${token.alerts24h}`
      );
    });

    // Alert Stats
    console.log(chalk.cyan('\n🔔 Alert Statistics'));
    console.log(`  Last triggered: ${chalk.dim(data.alerts.lastTriggered)}`);
    console.log(
      `  This week: ${chalk.bold(data.alerts.thisWeek)} alerts`
    );
    console.log(
      `  This month: ${chalk.bold(data.alerts.thisMonth)} alerts`
    );

    // Health Check
    console.log(chalk.cyan('\n🏥 System Health'));
    console.log(
      `  Webhook: ${chalk.green(chalk.bold(data.health.webhookStatus))}`
    );
    console.log(
      `  Success rate: ${chalk.green(data.health.successRate + '%')}`
    );
    console.log(
      `  Response time: ${chalk.bold(data.health.averageResponseTime)}`
    );
    console.log(
      `  Last check: ${chalk.dim(data.health.lastHealthCheck)}`
    );

    // Billing
    console.log(chalk.cyan('\n💳 Billing Information'));
    console.log(
      `  Cost per alert: ${chalk.bold('$' + data.billing.costPerAlert)}`
    );
    console.log(
      `  Estimated monthly: ${chalk.bold('$' + data.billing.estimatedMonthly)}`
    );
    console.log(
      `  Upcoming charges: ${chalk.bold('$' + data.billing.upcomingCharges)}`
    );
    console.log(
      `  Next billing: ${chalk.dim(data.billing.nextBillingDate)}`
    );

    // Recommendations
    if (data.agent.balance < 50) {
      console.log(chalk.yellow('\n⚠️  Recommendations'));
      console.log(
        chalk.yellow(
          '  Low balance detected. Consider recharging to maintain monitoring.'
        )
      );
    }

    if (data.subscriptions.paused > 0) {
      console.log(chalk.yellow('\n⚠️  Paused Subscriptions'));
      console.log(
        chalk.yellow(
          `  You have ${data.subscriptions.paused} paused subscription(s).`
        )
      );
      console.log(
        chalk.dim(
          '  Use `sentinel subscribe` to resume monitoring.'
        )
      );
    }

    console.log(chalk.gray('\n' + '═'.repeat(80)));
    console.log(
      chalk.dim(
        '\nManage subscriptions: `sentinel subscribe [token]`\nView alerts: `sentinel history`'
      )
    );
  }
}

export default StatusCommand;
