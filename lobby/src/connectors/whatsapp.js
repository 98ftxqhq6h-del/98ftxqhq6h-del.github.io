import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { askLobby } from '../assistant.js';

export function initWhatsApp(config) {
  if (!config.whatsapp.enabled) {
    console.log("ℹ️ [WhatsApp Bot]: Disabled in configuration.");
    return null;
  }

  console.log("🦞 [WhatsApp Bot]: Initializing WhatsApp Web engine...");

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: "lobby-client"
    }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    console.log("\n🦞 [WhatsApp Bot]: SCAN THIS QR CODE WITH YOUR PHONE'S WHATSAPP APP TO CONNECT:");
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    console.log('✔ [WhatsApp Bot]: Client is ready!');
  });

  client.on('message', async (msg) => {
    // Only respond to chats that aren't group chats (for privacy/simplicity)
    const chat = await msg.getChat();
    if (!chat.isGroup) {
      const reply = await askLobby(msg.body, `whatsapp-${msg.from}`);
      await msg.reply(reply);
    }
  });

  client.initialize().catch((err) => {
    console.error("⚠️ [WhatsApp Bot]: Failed to initialize:", err.message);
  });

  return client;
}
