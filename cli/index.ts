#!/usr/bin/env node

import { program } from 'commander';
import { AnalyzeCommand } from './commands/analyze';
import { SubscribeCommand } from './commands/subscribe';
import { BalanceCommand } from './commands/balance';
import { HistoryCommand } from './commands/history';
import { StatusCommand } from './commands/status';

const VERSION = '1.0.0';

async function main() {
  program
    .name('sentinel')
    .description('Solana Sentinel - On-chain Token Risk Monitoring CLI')
    .version(VERSION);

  // Analyze command - Perform token sentiment analysis
  new AnalyzeCommand(program).setup();

  // Subscribe command - Create a price monitoring subscription
  new SubscribeCommand(program).setup();

  // Balance command - Check account balance
  new BalanceCommand(program).setup();

  // History command - View alert history
  new HistoryCommand(program).setup();

  // Status command - Get subscription status
  new StatusCommand(program).setup();

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

main().catch((error) => {
  console.error('❌ CLI Error:', error.message);
  process.exit(1);
});
