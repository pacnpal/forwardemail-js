import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import {
  ForwardEmailConfig,
  EmailOptions,
  EmailResponse,
  EmailLimitResponse,
  Account,
  Domain,
  Alias,
  ListEmailsOptions,
  ErrorResponse,
} from './types';

/**
 * Forward Email API Client
 * 
 * Enterprise-grade, production-ready Node.js client for the Forward Email API.
 * Built with native Node.js modules - zero external dependencies.
 * Compatible with all Node.js web frameworks (Express, Fastify, Koa, Hapi, NestJS, etc.)
 */
export class ForwardEmail {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly agent: https.Agent;

  /**
   * Create a new Forward Email client instance
   * 
   * @param config - Configuration object with API key
   * @example
   * ```typescript
   * const forwardEmail = new ForwardEmail({
   *   apiKey: process.env.FORWARD_EMAIL_API_KEY
   * });
   * ```
   */
  constructor(config: ForwardEmailConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.forwardemail.net';
    this.timeout = config.timeout || 30000;

    // Create a persistent HTTP agent for connection pooling (production best practice)
    this.agent = new https.Agent({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: this.timeout,
    });
  }

  /**
   * Make an HTTP request using native Node.js https module
   * @private
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any,
    queryParams?: Record<string, any>
  ): Promise<T> {
    const url = new URL(path, this.baseURL);

    // Add query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // Prepare authentication header (Basic Auth with API key as username)
    const auth = Buffer.from(`${this.apiKey}:`).toString('base64');

    const options: https.RequestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'forwardemail-js/1.0.0',
        'Accept': 'application/json',
      },
      agent: this.agent,
      timeout: this.timeout,
    };

    return new Promise((resolve, reject) => {
      const protocol = url.protocol === 'https:' ? https : http;
      
      const req = protocol.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const statusCode = res.statusCode || 0;

            // Parse JSON response
            const parsedData = data ? JSON.parse(data) : {};

            // Handle HTTP errors
            if (statusCode >= 400) {
              const error = new Error(
                parsedData.message || `HTTP ${statusCode}: ${res.statusMessage}`
              ) as Error & { statusCode: number; response?: any };
              error.statusCode = statusCode;
              error.response = parsedData;
              reject(error);
              return;
            }

            resolve(parsedData as T);
          } catch (err) {
            reject(new Error(`Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`));
          }
        });
      });

      // Handle request errors
      req.on('error', (err) => {
        reject(new Error(`Request failed: ${err.message}`));
      });

      // Handle timeout
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.timeout}ms`));
      });

      // Send request body if present
      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * Send an email via the Forward Email API
   * 
   * @param options - Email options following Nodemailer's message configuration
   * @returns Promise with email response
   * @example
   * ```typescript
   * const result = await forwardEmail.sendEmail({
   *   from: 'sender@yourdomain.com',
   *   to: 'recipient@example.com',
   *   subject: 'Hello from Forward Email',
   *   text: 'This is a test email',
   *   html: '<p>This is a test email</p>'
   * });
   * ```
   */
  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    if (!options.from) {
      throw new Error('Email "from" field is required');
    }
    if (!options.to) {
      throw new Error('Email "to" field is required');
    }
    if (!options.subject) {
      throw new Error('Email "subject" field is required');
    }

    return this.request<EmailResponse>('POST', '/v1/emails', options);
  }

  /**
   * List all sent emails with optional filtering
   * 
   * @param options - Pagination and filtering options
   * @returns Promise with list of emails
   * @example
   * ```typescript
   * const emails = await forwardEmail.listEmails({
   *   page: 1,
   *   limit: 25,
   *   domain: 'yourdomain.com'
   * });
   * ```
   */
  async listEmails(options?: ListEmailsOptions): Promise<EmailResponse[]> {
    return this.request<EmailResponse[]>('GET', '/v1/emails', undefined, options);
  }

  /**
   * Get details of a specific email
   * 
   * @param emailId - The email ID
   * @returns Promise with email details
   * @example
   * ```typescript
   * const email = await forwardEmail.getEmail('email-id-123');
   * ```
   */
  async getEmail(emailId: string): Promise<EmailResponse> {
    if (!emailId) {
      throw new Error('Email ID is required');
    }
    return this.request<EmailResponse>('GET', `/v1/emails/${emailId}`);
  }

  /**
   * Delete a specific email
   * 
   * @param emailId - The email ID to delete
   * @returns Promise with success response
   * @example
   * ```typescript
   * await forwardEmail.deleteEmail('email-id-123');
   * ```
   */
  async deleteEmail(emailId: string): Promise<{ message: string }> {
    if (!emailId) {
      throw new Error('Email ID is required');
    }
    return this.request<{ message: string }>('DELETE', `/v1/emails/${emailId}`);
  }

  /**
   * Get current email sending limits
   * 
   * @returns Promise with limit information
   * @example
   * ```typescript
   * const limits = await forwardEmail.getEmailLimit();
   * console.log(`Used ${limits.count} of ${limits.limit} emails`);
   * ```
   */
  async getEmailLimit(): Promise<EmailLimitResponse> {
    return this.request<EmailLimitResponse>('GET', '/v1/emails/limit');
  }

  /**
   * Get account information
   * 
   * @returns Promise with account details
   * @example
   * ```typescript
   * const account = await forwardEmail.getAccount();
   * console.log(account.email, account.plan);
   * ```
   */
  async getAccount(): Promise<Account> {
    return this.request<Account>('GET', '/v1/account');
  }

  /**
   * Update account information
   * 
   * @param data - Account data to update
   * @returns Promise with updated account details
   * @example
   * ```typescript
   * const account = await forwardEmail.updateAccount({
   *   display_name: 'New Name',
   *   locale: 'en'
   * });
   * ```
   */
  async updateAccount(data: { display_name?: string; locale?: string }): Promise<Account> {
    return this.request<Account>('PUT', '/v1/account', data);
  }

  /**
   * List all domains
   * 
   * @returns Promise with list of domains
   * @example
   * ```typescript
   * const domains = await forwardEmail.listDomains();
   * ```
   */
  async listDomains(): Promise<Domain[]> {
    return this.request<Domain[]>('GET', '/v1/domains');
  }

  /**
   * Get details of a specific domain
   * 
   * @param domainId - The domain ID or name
   * @returns Promise with domain details
   * @example
   * ```typescript
   * const domain = await forwardEmail.getDomain('yourdomain.com');
   * ```
   */
  async getDomain(domainId: string): Promise<Domain> {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
    return this.request<Domain>('GET', `/v1/domains/${domainId}`);
  }

  /**
   * List all aliases for a domain
   * 
   * @param domainId - The domain ID or name
   * @returns Promise with list of aliases
   * @example
   * ```typescript
   * const aliases = await forwardEmail.listAliases('yourdomain.com');
   * ```
   */
  async listAliases(domainId: string): Promise<Alias[]> {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
    return this.request<Alias[]>('GET', `/v1/domains/${domainId}/aliases`);
  }

  /**
   * Get details of a specific alias
   * 
   * @param domainId - The domain ID or name
   * @param aliasId - The alias ID
   * @returns Promise with alias details
   * @example
   * ```typescript
   * const alias = await forwardEmail.getAlias('yourdomain.com', 'alias-id');
   * ```
   */
  async getAlias(domainId: string, aliasId: string): Promise<Alias> {
    if (!domainId || !aliasId) {
      throw new Error('Domain ID and Alias ID are required');
    }
    return this.request<Alias>('GET', `/v1/domains/${domainId}/aliases/${aliasId}`);
  }

  /**
   * Create a new alias
   * 
   * @param domainId - The domain ID or name
   * @param data - Alias creation data
   * @returns Promise with created alias
   * @example
   * ```typescript
   * const alias = await forwardEmail.createAlias('yourdomain.com', {
   *   name: 'hello',
   *   recipients: ['user@example.com']
   * });
   * ```
   */
  async createAlias(
    domainId: string,
    data: {
      name?: string;
      recipients?: string | string[];
      description?: string;
      labels?: string | string[];
      is_enabled?: boolean;
    }
  ): Promise<Alias> {
    if (!domainId) {
      throw new Error('Domain ID is required');
    }
    return this.request<Alias>('POST', `/v1/domains/${domainId}/aliases`, data);
  }

  /**
   * Update an existing alias
   * 
   * @param domainId - The domain ID or name
   * @param aliasId - The alias ID
   * @param data - Alias update data
   * @returns Promise with updated alias
   * @example
   * ```typescript
   * const alias = await forwardEmail.updateAlias('yourdomain.com', 'alias-id', {
   *   is_enabled: false
   * });
   * ```
   */
  async updateAlias(
    domainId: string,
    aliasId: string,
    data: {
      name?: string;
      recipients?: string | string[];
      description?: string;
      labels?: string | string[];
      is_enabled?: boolean;
    }
  ): Promise<Alias> {
    if (!domainId || !aliasId) {
      throw new Error('Domain ID and Alias ID are required');
    }
    return this.request<Alias>('PUT', `/v1/domains/${domainId}/aliases/${aliasId}`, data);
  }

  /**
   * Delete an alias
   * 
   * @param domainId - The domain ID or name
   * @param aliasId - The alias ID
   * @returns Promise with success response
   * @example
   * ```typescript
   * await forwardEmail.deleteAlias('yourdomain.com', 'alias-id');
   * ```
   */
  async deleteAlias(domainId: string, aliasId: string): Promise<{ message: string }> {
    if (!domainId || !aliasId) {
      throw new Error('Domain ID and Alias ID are required');
    }
    return this.request<{ message: string }>('DELETE', `/v1/domains/${domainId}/aliases/${aliasId}`);
  }

  /**
   * Close the HTTP agent and clean up resources
   * Call this when shutting down your application for graceful cleanup
   * 
   * @example
   * ```typescript
   * process.on('SIGTERM', () => {
   *   forwardEmail.close();
   *   process.exit(0);
   * });
   * ```
   */
  close(): void {
    this.agent.destroy();
  }
}
