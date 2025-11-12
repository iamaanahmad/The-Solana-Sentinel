import { Command } from 'commander';
import { BaseCommand } from '../base-command';
import chalk from 'chalk';

export class BalanceCommand extends BaseCommand {
  setup(): void {
    const command = new Command('balance')
      .description('Check your subscription balance')
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

  private async execute(options: { pubkey?: string; json?: boolean }) {
    try {
      const agentPubkey = options.pubkey;

      if (!agentPubkey) {
        this.warn('No public key provided. Showing sample balance data.');
        this.displaySampleBalance(options.json ?? false);
        return;
      }

      this.info(`Fetching balance for ${agentPubkey}...`);

      // Mock balance data (in production, would fetch from API)
      const balanceData = {
        agentPubkey,
        balance: 5.25,
        currency: 'USDC',
        subscription: {
          tier: 'basic',
          alertsRemaining: 105,
          alertCost: 0.05,
          nextReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        recentTransactions: [
          {
            type: 'Alert',
            amount: -0.05,
            tokenAddress: 'EPjFWaLb3odcccccccccccccccccccccccccccccc',
            timestamp: new Date(Date.now() - 60000).toISOString(),
          },
          {
            type: 'Deposit',
            amount: 5.3,
            description: 'x402 hackathon rewards',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
        ],
      };

      if (options.json) {
        console.log(JSON.stringify(balanceData, null, 2));
      } else {
        this.displayBalance(balanceData);
        this.success('Balance fetched successfully');
      }
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'Failed to fetch balance'
      );
      process.exit(1);
    }
  }

  private displayBalance(data: any) {
    console.log();
    console.log(chalk.bold(`💰 Subscription Balance`));
    console.log(chalk.gray('═'.repeat(60)));

    // Balance Summary
    console.log(chalk.cyan('\n💵 Current Balance'));
    console.log(`  ${chalk.bold(data.balance.toFixed(2))} ${data.currency}`);

    // Tier Info
    console.log(chalk.cyan('\n🎯 Subscription Tier'));
    console.log(`  Tier: ${chalk.bold(data.subscription.tier.toUpperCase())}`);
    console.log(
      `  Cost per alert: $${data.subscription.alertCost.toFixed(2)}`
    );
    console.log(
      `  Alerts available: ${chalk.green(data.subscription.alertsRemaining)}`
    );

    // Estimated Usage
    const monthsOfUse = Math.floor(
      (data.balance / data.subscription.alertCost) * 30
    );
    console.log(chalk.cyan('\n📊 Estimated Usage'));
    console.log(
      `  Months until depletion: ${chalk.bold(monthsOfUse)} months (at 1 alert/day)`
    );
    console.log(
      `  Daily cost (1 alert): $${(data.subscription.alertCost * 1).toFixed(4)}`
    );

    // Recharge info
    console.log(chalk.cyan('\n🔄 Recharge Info'));
    console.log(
      `  Next billing date: ${new Date(data.subscription.nextReset).toLocaleDateString()}`
    );
    console.log(
      `  Recommended top-up: $10.00 per month`
    );

    // Recent Transactions
    if (data.recentTransactions.length > 0) {
      console.log(chalk.cyan('\n📋 Recent Transactions'));
      data.recentTransactions.forEach((txn: any) => {
        const color = txn.amount > 0 ? 'green' : 'red';
        const sign = txn.amount > 0 ? '+' : '';
        console.log(
          `  • ${txn.type}: ${chalk[color](
            `${sign}$${Math.abs(txn.amount).toFixed(2)}`
          )} - ${new Date(txn.timestamp).toLocaleString()}`
        );
      });
    }

    // Low Balance Warning
    if (data.balance < 1) {
      console.log();
      console.log(
        chalk.yellow(
          '⚠️  Low balance! Add funds soon to avoid alert disruptions.'
        )
      );
    }

    console.log(chalk.gray('\n' + '═'.repeat(60)));
    console.log(chalk.dim('\nUse `sentinel subscribe` to create new subscriptions'));
  }

  private displaySampleBalance(asJson: boolean) {
    const sample = {
      balance: 0,
      note: 'No public key provided. Use: sentinel balance --pubkey <your-wallet-address>',
    };

    if (asJson) {
      console.log(JSON.stringify(sample, null, 2));
    } else {
      console.log();
      console.log(chalk.yellow('Sample Balance Data'));
      console.log(chalk.gray('═'.repeat(60)));
      console.log(`  ${sample.note}`);
      console.log();
      console.log(
        chalk.dim(
          'Example: sentinel balance --pubkey EPjFWaLb3odcccccccccccccccccccccccccccccc'
        )
      );
      console.log(chalk.gray('═'.repeat(60)));
    }
  }
}

export default BalanceCommand;
