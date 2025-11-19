const Hapi = require('@hapi/hapi');
const { ForwardEmail } = require('forwardemail-js');

const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY || 'your-key'
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  server.route({
    method: 'POST',
    path: '/send-email',
    handler: async (request, h) => {
      try {
        const { to, subject, html } = request.payload;
        
        if (!to || !subject || !html) {
          return h.response({ error: 'Missing required fields' }).code(400);
        }

        const result = await emailClient.sendEmail({
          from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
          to,
          subject,
          html
        });
        
        return { success: true, id: result.id };
      } catch (error) {
        return h.response({ error: error.message }).code(500);
      }
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);

  // Cleanup
  process.on('SIGTERM', async () => {
    emailClient.close();
    await server.stop();
    process.exit(0);
  });
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
