/**
 * Fastify Example
 * 
 * Demonstrates how to create a Fastify plugin for forwardemail-js
 */

const Fastify = require('fastify');
const fp = require('fastify-plugin');
const { ForwardEmail } = require('forwardemail-js');

// 1. Create the plugin
const emailPlugin = fp(async (fastify, options) => {
  if (!options.apiKey) {
    throw new Error('apiKey is required for email plugin');
  }

  const client = new ForwardEmail({
    apiKey: options.apiKey,
    timeout: options.timeout || 30000
  });

  // Decorate fastify instance with 'email'
  fastify.decorate('email', client);

  // Clean up on close
  fastify.addHook('onClose', () => {
    client.close();
  });
});

// 2. Create the server
const buildServer = async () => {
  const fastify = Fastify({ logger: true });

  // Register the plugin
  await fastify.register(emailPlugin, {
    apiKey: process.env.FORWARD_EMAIL_API_KEY || 'dummy-key',
  });

  // 3. Define routes
  fastify.post('/send-email', async (request, reply) => {
    const { to, subject, text, html } = request.body;

    if (!to || !subject) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    try {
      const result = await fastify.email.sendEmail({
        from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
        to,
        subject,
        text,
        html,
      });

      return { success: true, id: result.id };
    } catch (error) {
      request.log.error(error);
      return reply.code(error.statusCode || 500).send({ 
        error: error.message || 'Failed to send email' 
      });
    }
  });

  fastify.get('/limits', async (request, reply) => {
    try {
      const limits = await fastify.email.getEmailLimit();
      return limits;
    } catch (error) {
      return reply.code(500).send({ error: error.message });
    }
  });

  return fastify;
};

// 4. Run server
if (require.main === module) {
  buildServer().then(server => {
    server.listen({ port: 3000 }, (err) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
    });
  });
}

module.exports = buildServer;
