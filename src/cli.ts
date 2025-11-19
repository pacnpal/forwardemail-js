#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import { ForwardEmail } from './client';

const CONFIG_DIR = path.join(os.homedir(), '.forwardemail');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface CLIConfig {
  apiKey?: string;
  baseURL?: string;
  defaultFrom?: string;
}

/**
 * CLI Helper Functions
 */

function printHelp(): void {
  console.log(`
Forward Email CLI - Enterprise Email API Tool

USAGE:
  forwardemail [command] [options]
  fe [command] [options]

COMMANDS:
  config               Configure API key and settings
  test                 Test email sending
  send                 Send an email
  list                 List sent emails
  account              Get account information
  limits               Check email sending limits
  domains              List all domains
  aliases              List aliases for a domain
  help                 Show this help message

EXAMPLES:
  # Configure API key
  forwardemail config

  # Test email sending
  forwardemail test

  # Send an email
  forwardemail send --from "you@domain.com" --to "user@example.com" \\
    --subject "Hello" --text "Test message"

  # List recent emails
  forwardemail list

  # Check account info
  forwardemail account

  # Check sending limits
  forwardemail limits

  # List domains
  forwardemail domains

  # List aliases for a domain
  forwardemail aliases yourdomain.com

OPTIONS:
  --help               Show help for a command
  --from              Sender email address
  --to                Recipient email address
  --subject           Email subject
  --text              Plain text content
  --html              HTML content
  --cc                CC recipients (comma-separated)
  --bcc               BCC recipients (comma-separated)
  --api-key           API key (overrides config)

CONFIGURATION:
  Config file: ~/.forwardemail/config.json

For more info, visit: https://forwardemail.net/api
`);
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConfig(): CLIConfig {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error loading config:', err);
      return {};
    }
  }
  return {};
}

function saveConfig(config: CLIConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

function promptInput(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const nextArg = argv[i + 1];
      
      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    } else if (!args.command) {
      args.command = argv[i];
    }
  }

  return args;
}

function getClient(apiKeyOverride?: string): ForwardEmail {
  const config = loadConfig();
  const apiKey = apiKeyOverride || config.apiKey;

  if (!apiKey) {
    console.error('Error: API key not configured.');
    console.error('Run "forwardemail config" to configure your API key.');
    process.exit(1);
  }

  return new ForwardEmail({
    apiKey,
    baseURL: config.baseURL,
  });
}

/**
 * CLI Commands
 */

async function configCommand(): Promise<void> {
  console.log('Forward Email Configuration\n');

  const apiKey = await promptInput('Enter your API key: ');
  const baseURL = await promptInput('Enter base URL (press enter for default): ');
  const defaultFrom = await promptInput('Enter default "from" email (optional): ');

  const config: CLIConfig = {
    apiKey: apiKey || undefined,
    baseURL: baseURL || undefined,
    defaultFrom: defaultFrom || undefined,
  };

  saveConfig(config);
  console.log('\n✓ Configuration saved to:', CONFIG_FILE);
  console.log('\nYou can now use the CLI to send emails!');
}

async function testCommand(args: Record<string, string | boolean>): Promise<void> {
  console.log('Testing Forward Email API...\n');

  const client = getClient(args['api-key'] as string);
  const config = loadConfig();

  try {
    // Test 1: Get account info
    console.log('1. Testing account access...');
    const account = await client.getAccount();
    console.log(`   ✓ Account: ${account.email} (${account.plan} plan)`);

    // Test 2: Get email limits
    console.log('\n2. Testing email limits...');
    const limits = await client.getEmailLimit();
    console.log(`   ✓ Email usage: ${limits.count}/${limits.limit}`);

    // Test 3: List domains
    console.log('\n3. Testing domain access...');
    const domains = await client.listDomains();
    console.log(`   ✓ Found ${domains.length} domain(s)`);
    
    if (domains.length > 0) {
      console.log(`   First domain: ${domains[0].name}`);
    }

    console.log('\n✓ All tests passed! API is working correctly.');
    
    client.close();
  } catch (err: any) {
    console.error('\n✗ Test failed:', err.message);
    if (err.statusCode) {
      console.error(`   HTTP Status: ${err.statusCode}`);
    }
    process.exit(1);
  }
}

async function sendCommand(args: Record<string, string | boolean>): Promise<void> {
  const client = getClient(args['api-key'] as string);
  const config = loadConfig();

  const from = (args.from as string) || config.defaultFrom;
  const to = args.to as string;
  const subject = args.subject as string;
  const text = args.text as string;
  const html = args.html as string;

  if (!from || !to || !subject) {
    console.error('Error: --from, --to, and --subject are required');
    process.exit(1);
  }

  if (!text && !html) {
    console.error('Error: Either --text or --html content is required');
    process.exit(1);
  }

  try {
    console.log('Sending email...\n');
    
    const result = await client.sendEmail({
      from,
      to,
      subject,
      text,
      html,
      cc: args.cc as string,
      bcc: args.bcc as string,
    });

    console.log('✓ Email sent successfully!');
    console.log(`   ID: ${result.id}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message ID: ${result.messageId}`);
    
    client.close();
  } catch (err: any) {
    console.error('✗ Failed to send email:', err.message);
    if (err.statusCode) {
      console.error(`   HTTP Status: ${err.statusCode}`);
    }
    process.exit(1);
  }
}

async function listCommand(args: Record<string, string | boolean>): Promise<void> {
  const client = getClient(args['api-key'] as string);

  try {
    console.log('Fetching recent emails...\n');
    
    const emails = await client.listEmails({
      limit: 10,
      page: 1,
    });

    if (emails.length === 0) {
      console.log('No emails found.');
    } else {
      console.log(`Found ${emails.length} recent email(s):\n`);
      
      emails.forEach((email, index) => {
        console.log(`${index + 1}. ${email.subject}`);
        console.log(`   From: ${email.envelope.from}`);
        console.log(`   To: ${email.envelope.to.join(', ')}`);
        console.log(`   Status: ${email.status}`);
        console.log(`   Date: ${email.date}`);
        console.log(`   ID: ${email.id}\n`);
      });
    }
    
    client.close();
  } catch (err: any) {
    console.error('✗ Failed to list emails:', err.message);
    process.exit(1);
  }
}

async function accountCommand(args: Record<string, string | boolean>): Promise<void> {
  const client = getClient(args['api-key'] as string);

  try {
    const account = await client.getAccount();

    console.log('Account Information:\n');
    console.log(`  Email: ${account.email}`);
    console.log(`  Plan: ${account.plan}`);
    console.log(`  Display Name: ${account.display_name || 'N/A'}`);
    console.log(`  Locale: ${account.locale || 'N/A'}`);
    console.log(`  2FA Enabled: ${account.otp_enabled ? 'Yes' : 'No'}`);
    console.log(`  Created: ${account.created_at}`);
    
    client.close();
  } catch (err: any) {
    console.error('✗ Failed to get account info:', err.message);
    process.exit(1);
  }
}

async function limitsCommand(args: Record<string, string | boolean>): Promise<void> {
  const client = getClient(args['api-key'] as string);

  try {
    const limits = await client.getEmailLimit();

    console.log('Email Sending Limits:\n');
    console.log(`  Used: ${limits.count}`);
    console.log(`  Limit: ${limits.limit}`);
    console.log(`  Remaining: ${limits.limit - limits.count}`);
    
    const percentage = ((limits.count / limits.limit) * 100).toFixed(1);
    console.log(`  Usage: ${percentage}%`);
    
    client.close();
  } catch (err: any) {
    console.error('✗ Failed to get limits:', err.message);
    process.exit(1);
  }
}

async function domainsCommand(args: Record<string, string | boolean>): Promise<void> {
  const client = getClient(args['api-key'] as string);

  try {
    console.log('Fetching domains...\n');
    
    const domains = await client.listDomains();

    if (domains.length === 0) {
      console.log('No domains found.');
    } else {
      console.log(`Found ${domains.length} domain(s):\n`);
      
      domains.forEach((domain, index) => {
        console.log(`${index + 1}. ${domain.name}`);
        console.log(`   Plan: ${domain.plan}`);
        console.log(`   MX Record: ${domain.has_mx_record ? '✓' : '✗'}`);
        console.log(`   TXT Record: ${domain.has_txt_record ? '✓' : '✗'}`);
        console.log(`   SMTP Enabled: ${domain.has_smtp ? 'Yes' : 'No'}`);
        console.log(`   Created: ${domain.created_at}\n`);
      });
    }
    
    client.close();
  } catch (err: any) {
    console.error('✗ Failed to list domains:', err.message);
    process.exit(1);
  }
}

async function aliasesCommand(domainName: string, args: Record<string, string | boolean>): Promise<void> {
  if (!domainName) {
    console.error('Error: Domain name is required');
    console.error('Usage: forwardemail aliases <domain>');
    process.exit(1);
  }

  const client = getClient(args['api-key'] as string);

  try {
    console.log(`Fetching aliases for ${domainName}...\n`);
    
    const aliases = await client.listAliases(domainName);

    if (aliases.length === 0) {
      console.log('No aliases found.');
    } else {
      console.log(`Found ${aliases.length} alias(es):\n`);
      
      aliases.forEach((alias, index) => {
        console.log(`${index + 1}. ${alias.name}@${alias.domain.name}`);
        console.log(`   Recipients: ${alias.recipients.join(', ')}`);
        console.log(`   Enabled: ${alias.is_enabled ? 'Yes' : 'No'}`);
        console.log(`   IMAP: ${alias.has_imap ? 'Yes' : 'No'}`);
        console.log(`   Created: ${alias.created_at}\n`);
      });
    }
    
    client.close();
  } catch (err: any) {
    console.error('✗ Failed to list aliases:', err.message);
    process.exit(1);
  }
}

/**
 * Main CLI Entry Point
 */

async function main(): Promise<void> {
  const args = parseArgs();
  const command = args.command as string;

  if (!command || command === 'help' || args.help) {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'config':
        await configCommand();
        break;
      case 'test':
        await testCommand(args);
        break;
      case 'send':
        await sendCommand(args);
        break;
      case 'list':
        await listCommand(args);
        break;
      case 'account':
        await accountCommand(args);
        break;
      case 'limits':
        await limitsCommand(args);
        break;
      case 'domains':
        await domainsCommand(args);
        break;
      case 'aliases':
        await aliasesCommand(args.command as string, args);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Run "forwardemail help" for usage information.');
        process.exit(1);
    }
  } catch (err: any) {
    console.error('Unexpected error:', err.message);
    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
