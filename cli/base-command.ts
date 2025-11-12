import { Command } from 'commander';
import chalk from 'chalk';

export interface CommandConfig {
  name: string;
  description: string;
  options?: Array<{
    flags: string;
    description: string;
    defaultValue?: string | boolean;
  }>;
}

export abstract class BaseCommand {
  protected apiUrl: string;

  constructor(protected program: Command) {
    this.apiUrl = process.env.API_URL || 'http://localhost:9002';
  }

  abstract setup(): void;

  protected async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `API error: ${response.status}`);
    }

    return result;
  }

  protected success(message: string, data?: any) {
    console.log(chalk.green('✅ ' + message));
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  protected error(message: string) {
    console.error(chalk.red('❌ ' + message));
  }

  protected info(message: string) {
    console.log(chalk.blue('ℹ️  ' + message));
  }

  protected warn(message: string) {
    console.log(chalk.yellow('⚠️  ' + message));
  }
}
