import { Telegraf } from 'telegraf';
import { askLobby } from '../assistant.js';

export function initTelegram(config) {
  if (!config.telegram.enabled || !config.telegram.token) {
    console.log("ℹ️ [Telegram Bot]: Disabled or missing token.");
    return null;
  }

  const bot = new Telegraf(config.telegram.token);

  bot.start((ctx) => {
    ctx.reply("🦞 *clicks claws* Hello! I am Lobby, your local lobster assistant! Direct message me anytime to talk!");
  });

  bot.help((ctx) => {
    ctx.reply("Ask me anything! I run completely locally on Anurag's machine!");
  });

  bot.on('message', async (ctx) => {
    // Check if it's text message
    if (ctx.message.text) {
      const reply = await askLobby(ctx.message.text, `telegram-${ctx.chat.id}`);
      await ctx.reply(reply);
    } else if (ctx.message.voice) {
      await ctx.reply("🦞 *clicks claws* I can hear you wiggling, but voice message transcription is coming in a future update! Try typing to me for now!");
    }
  });

  bot.launch()
    .then(() => console.log("✔ [Telegram Bot]: Online and listening!"))
    .catch((err) => console.error("⚠️ [Telegram Bot]: Failed to start:", err.message));

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
}
