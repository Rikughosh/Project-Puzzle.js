// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Load plugins
const plugins = [
  'auth', 'logger', 'metrics', 'rateLimiter', 'openai', 'twilio',
  'email', 'sms', 'chatSocket', 'webhooks', 'analytics', 'notifications',
  'userManagement', 'roleBasedAccess', 'session', 'db', 'errorHandler',
  'fileUpload', 'payment', 'chatbot', 'supportTickets', 'cache'
];

plugins.forEach((plugin) => {
  require(`./plugins/${plugin}`)(app, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Plugin: plugins/auth.js
module.exports = (app) => {
  app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '1234') {
      res.json({ token: 'fake-jwt-token' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
};

// Plugin: plugins/logger.js
module.exports = (app) => {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
};

// Plugin: plugins/metrics.js
module.exports = (app) => {
  app.get('/metrics', (req, res) => {
    res.json({ uptime: process.uptime(), memory: process.memoryUsage() });
  });
};

// Plugin: plugins/rateLimiter.js
const rateLimit = require('express-rate-limit');
module.exports = (app) => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use(limiter);
};

// Plugin: plugins/openai.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
module.exports = (app) => {
  app.post('/ai/coach', async (req, res) => {
    try {
      const { message } = req.body;
      const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Coach agent response.' },
          { role: 'user', content: message }
        ]
      });
      res.json({ reply: result.choices[0].message.content });
    } catch (err) {
      res.status(500).json({ error: 'AI error' });
    }
  });
};

// Plugin: plugins/twilio.js
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
module.exports = (app) => {
  app.post('/twilio/sms', async (req, res) => {
    try {
      await client.messages.create({
        body: req.body.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: req.body.to
      });
      res.json({ status: 'sent' });
    } catch (err) {
      res.status(500).json({ error: 'Twilio error' });
    }
  });
};

// Plugin: plugins/email.js
module.exports = (app) => {
  app.post('/email/send', (req, res) => {
    const { to, subject, text } = req.body;
    console.log(`Simulating email to ${to}: ${subject}`);
    res.json({ status: 'sent (simulated)' });
  });
};

// Plugin: plugins/sms.js
module.exports = (app) => {
  app.post('/sms/send', (req, res) => {
    const { number, text } = req.body;
    console.log(`Sending SMS to ${number}: ${text}`);
    res.json({ status: 'SMS sent (mock)' });
  });
};

// Plugin: plugins/chatSocket.js
module.exports = (app, io) => {
  io.on('connection', (socket) => {
    console.log('Agent connected:', socket.id);
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
  });
};

// Plugin: plugins/webhooks.js
module.exports = (app) => {
  app.post('/webhook/event', (req, res) => {
    console.log('Webhook received:', req.body);
    res.sendStatus(200);
  });
};

// Plugin: plugins/analytics.js
module.exports = (app) => {
  app.get('/analytics', (req, res) => {
    res.json({ users: 120, ticketsResolved: 87 });
  });
};

// Plugin: plugins/notifications.js
module.exports = (app) => {
  app.post('/notify', (req, res) => {
    console.log('Notify user:', req.body);
    res.json({ status: 'notified (mock)' });
  });
};

// Plugin: plugins/userManagement.js
module.exports = (app) => {
  app.get('/users', (req, res) => {
    res.json([{ id: 1, name: 'Agent A' }]);
  });
};

// Plugin: plugins/roleBasedAccess.js
module.exports = (app) => {
  app.use((req, res, next) => {
    req.user = { role: 'agent' }; // mock
    next();
  });
};

// Plugin: plugins/session.js
module.exports = (app) => {
  app.get('/session', (req, res) => {
    res.json({ sessionId: 'abc123', user: 'Agent A' });
  });
};

// Plugin: plugins/db.js
module.exports = (app) => {
  console.log('DB plugin initialized');
};

// Plugin: plugins/errorHandler.js
module.exports = (app) => {
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  });
};

// Plugin: plugins/fileUpload.js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
module.exports = (app) => {
  app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ filename: req.file.filename });
  });
};

// Plugin: plugins/payment.js
module.exports = (app) => {
  app.post('/payment', (req, res) => {
    console.log('Processing payment:', req.body);
    res.json({ status: 'payment simulated' });
  });
};

// Plugin: plugins/chatbot.js
module.exports = (app) => {
  app.post('/chatbot', (req, res) => {
    const message = req.body.message;
    res.json({ response: `Echo: ${message}` });
  });
};

// Plugin: plugins/supportTickets.js
module.exports = (app) => {
  app.get('/tickets', (req, res) => {
    res.json([{ id: 1, subject: 'Login issue', status: 'open' }]);
  });
};

// Plugin: plugins/cache.js
const cache = {};
module.exports = (app) => {
  app.post('/cache/set', (req, res) => {
    const { key, value } = req.body;
    cache[key] = value;
    res.json({ status: 'cached' });
  });
  app.get('/cache/get/:key', (req, res) => {
    res.json({ value: cache[req.params.key] || null });
  });
};
