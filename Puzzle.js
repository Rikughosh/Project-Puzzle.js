// File: server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Load plugins (exactly 22)
const plugins = [
  'auth', 'logger', 'metrics', 'rateLimiter', 'openai', 'twilio',
  'email', 'sms', 'chatSocket', 'webhooks', 'analytics', 'notifications',
  'userManagement', 'roleBasedAccess', 'session', 'db', 'errorHandler',
  'fileUpload', 'payment', 'chatbot', 'supportTickets', 'multiLanguageSupport'
];

plugins.forEach((plugin) => {
  require(`./plugins/${plugin}`)(app, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// File: plugins/multiLanguageSupport.js
const messages = {
  en: { greeting: 'Hello', farewell: 'Goodbye' },
  es: { greeting: 'Hola', farewell: 'Adiós' },
};
module.exports = (app) => {
  app.get('/lang/:lang/greet', (req, res) => {
    const lang = req.params.lang;
    res.json({ message: messages[lang]?.greeting || messages.en.greeting });
  });
};
