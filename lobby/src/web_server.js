import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';
import { askLobby } from './assistant.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function startWebServer() {
  const config = loadConfig();
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  // Serve public frontend
  app.use(express.static(path.join(__dirname, '../public')));

  // WebSocket for real-time voice-to-text chat
  wss.on('connection', (ws) => {
    console.log('🦞 [Web Portal]: New voice link connected.');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'text_query') {
          const userQuery = data.text;
          const reply = await askLobby(userQuery, 'web-voice');
          ws.send(JSON.stringify({ type: 'reply', text: reply }));
        }
      } catch (err) {
        console.error('Web Socket error:', err.message);
      }
    });

    ws.on('close', () => {
      console.log('🦞 [Web Portal]: Voice link closed.');
    });
  });

  server.listen(config.web.port, config.web.host, () => {
    console.log(`🦞 [Web Portal]: Online at http://localhost:${config.web.port}`);
    console.log(`🦞 [Web Portal]: Connect your phone via local IP on your Wi-Fi network!`);
  });

  return server;
}
