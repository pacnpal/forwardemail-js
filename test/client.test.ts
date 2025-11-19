import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ForwardEmail } from '../dist/client.js';

describe('ForwardEmail Client', () => {
  describe('Constructor', () => {
    it('should throw error when API key is missing', () => {
      assert.throws(() => {
        // @ts-ignore - Testing invalid input
        new ForwardEmail({});
      }, /API key is required/);
    });

    it('should create client with valid API key', () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      assert.ok(client);
      client.close();
    });

    it('should use default baseURL when not provided', () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      assert.ok(client);
      client.close();
    });

    it('should accept custom baseURL', () => {
      const client = new ForwardEmail({
        apiKey: 'test-key',
        baseURL: 'https://custom-api.example.com'
      });
      assert.ok(client);
      client.close();
    });

    it('should accept custom timeout', () => {
      const client = new ForwardEmail({
        apiKey: 'test-key',
        timeout: 60000
      });
      assert.ok(client);
      client.close();
    });
  });

  describe('sendEmail validation', () => {
    it('should require "from" field', async () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      
      await assert.rejects(
        async () => {
          // @ts-ignore - Testing invalid input
          await client.sendEmail({
            to: 'test@example.com',
            subject: 'Test'
          });
        },
        /Email "from" field is required/
      );
      
      client.close();
    });

    it('should require "to" field', async () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      
      await assert.rejects(
        async () => {
          // @ts-ignore - Testing invalid input
          await client.sendEmail({
            from: 'sender@example.com',
            subject: 'Test'
          });
        },
        /Email "to" field is required/
      );
      
      client.close();
    });

    it('should require "subject" field', async () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      
      await assert.rejects(
        async () => {
          // @ts-ignore - Testing invalid input
          await client.sendEmail({
            from: 'sender@example.com',
            to: 'test@example.com'
          });
        },
        /Email "subject" field is required/
      );
      
      client.close();
    });
  });

  describe('Domain and Alias methods', () => {
    it('should validate domainId in getDomain', async () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      
      await assert.rejects(
        async () => {
          // @ts-ignore - Testing invalid input
          await client.getDomain('');
        },
        /Domain ID is required/
      );
      
      client.close();
    });

    it('should validate domainId and aliasId in getAlias', async () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      
      await assert.rejects(
        async () => {
          // @ts-ignore - Testing invalid input
          await client.getAlias('', 'alias123');
        },
        /Domain ID and Alias ID are required/
      );
      
      client.close();
    });
  });

  describe('Resource cleanup', () => {
    it('should close connections gracefully', () => {
      const client = new ForwardEmail({ apiKey: 'test-key' });
      assert.doesNotThrow(() => {
        client.close();
      });
    });
  });
});
