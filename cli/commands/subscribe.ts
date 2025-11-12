import { Command } from 'commander';
import { BaseCommand } from '../base-command';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export class SubscribeCommand extends BaseCommand {
  private configPath = path.join(process.cwd(), '.sentinel-config.json');

  setup(): void {
    const command = new Command('subscribe')
      .description('Create a price monitoring subscription')
      .argument('<token-address>', 'Solana token mint address')
      .option(
        '-t, --threshold <number>',
        'Risk threshold (0-100)',
        '75'
      )
      .option(
        '-w, --webhook <url>',
        'Webhook URL for alerts'
      )
      .option(
        '-f, --feed <address>',
        'Switchboard feed address'
      )
      .option(
        '-p, --pubkey <address>',
        'Agent public key (saved in config if not provided)'
      )
      .option(
        '--save',
        'Save subscription config locally',
        true
      )
      .action((tokenAddress, options) =>
        this.execute(tokenAddress, options)
      );

    this.program.addCommand(command);
  }

  private async execute(
    tokenAddress: string,
    options: {
      threshold: string;
      webhook?: string;
      feed?: string;
      pubkey?: string;
      save?: boolean;
    }
  ) {
    try {
      // Get or prompt for pubkey
      const agentPubkey =
        options.pubkey ||
        this.loadConfig('agentPubkey') ||
        (await this.prompt('Enter your Solana wallet address: '));

      if (!agentPubkey) {
        throw new Error('Agent pubkey is required');
      }

      // Get webhook URL
      const webhookUrl =
        options.webhook ||
        this.loadConfig('webhookUrl') ||
        (await this.prompt('Enter webhook URL for alerts: '));

      if (!webhookUrl) {
        throw new Error('Webhook URL is required');
      }

      // Get feed address
      const feedAddress =
        options.feed ||
        this.loadConfig(`feeds.${tokenAddress}`) ||
        (await this.prompt('Enter Switchboard feed address: '));

      if (!feedAddress) {
        throw new Error('Feed address is required');
      }

      const thresholdScore = parseInt(options.threshold);
      if (isNaN(thresholdScore) || thresholdScore < 0 || thresholdScore > 100) {
        throw new Error('Threshold must be between 0 and 100');
      }

      this.info(`Creating subscription for ${tokenAddress}...`);

      // Call API to create subscription
      const result = await this.request('POST', '/api/subscribe', {
        agentPubkey,
        tokenAddress,
        webhookUrl,
        thresholds: {
          risk_score: thresholdScore,
        },
      });

      // Save config
      if (options.save) {
        this.saveConfig({
          agentPubkey,
          webhookUrl,
          [`feeds.${tokenAddress}`]: feedAddress,
        });
      }

      this.success('Subscription created successfully!', {
        subscriptionId: (result as any).data?.id,
        tokenAddress,
        threshold: thresholdScore,
        webhookUrl: webhookUrl.substring(0, 30) + '...',
      });

      this.info('Alerts will be sent to your webhook URL');
      this.info('Check balance with: sentinel balance');
    } catch (error) {
      this.error(
        error instanceof Error ? error.message : 'Subscription failed'
      );
      process.exit(1);
    }
  }

  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      process.stdout.write(chalk.cyan(`? ${question} `));
      let answer = '';

      process.stdin.on('data', (key) => {
        const keyStr = key.toString();
        if (keyStr === '\n' || keyStr === '\r\n') {
          process.stdin.removeAllListeners('data');
          resolve(answer);
        } else {
          answer += keyStr.replace(/\r/g, '').replace(/\n/g, '');
        }
      });
    });
  }

  private loadConfig(key?: string): string | undefined {
    try {
      if (!fs.existsSync(this.configPath)) {
        return undefined;
      }

      const config = JSON.parse(
        fs.readFileSync(this.configPath, 'utf-8')
      );

      if (!key) return config;
      return key.split('.').reduce((obj: any, k) => obj?.[k], config);
    } catch {
      return undefined;
    }
  }

  private saveConfig(updates: Record<string, any>) {
    try {
      let config = {};

      if (fs.existsSync(this.configPath)) {
        config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
      }

      config = { ...config, ...updates };
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      this.info(`Config saved to ${this.configPath}`);
    } catch (error) {
      this.warn('Could not save config locally');
    }
  }
}

export default SubscribeCommand;
