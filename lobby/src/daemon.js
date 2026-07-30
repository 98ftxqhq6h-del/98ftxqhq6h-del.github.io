import { loadConfig } from './config.js';
import { initTelegram } from './connectors/telegram.js';
import { initDiscord } from './connectors/discord.js';
import { initSlack } from './connectors/slack.js';
import { initWhatsApp } from './connectors/whatsapp.js';
import { startWebServer } from './web_server.js';

async function main() {
  console.log("🦞 [Lobby Core]: Waking up Lobby, the local personal assistant...");
  
  const config = loadConfig();

  // Start the voice/web server portal
  startWebServer();

  // Start chat apps connectors
  try {
    initTelegram(config);
  } catch (err) {
    console.error("⚠️ Failed to load Telegram connector:", err.message);
  }

  try {
    initDiscord(config);
  } catch (err) {
    console.error("⚠️ Failed to load Discord connector:", err.message);
  }

  try {
    initSlack(config);
  } catch (err) {
    console.error("⚠️ Failed to load Slack connector:", err.message);
  }

  try {
    initWhatsApp(config);
  } catch (err) {
    console.error("⚠️ Failed to load WhatsApp connector:", err.message);
  }

  console.log("🦞 [Lobby Core]: Ready to pinch any tasks you throw at me! Direct messages only, please.");
}

main().catch((err) => {
  console.error("💥 Fatal Daemon Error:", err.message);
});
