const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { ForwardEmail } = require('forwardemail-js');

const app = new Koa();
const router = new Router();

const emailClient = new ForwardEmail({
  apiKey: process.env.FORWARD_EMAIL_API_KEY || 'dummy-key',
});

app.use(bodyParser());

router.post('/send-email', async (ctx) => {
  const { to, subject, html } = ctx.request.body;
  
  if (!to || !subject) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields' };
    return;
  }

  try {
    const result = await emailClient.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'noreply@yourdomain.com',
      to,
      subject,
      html
    });
    
    ctx.body = { success: true, id: result.id };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Koa server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  emailClient.close();
  server.close(() => process.exit(0));
});
