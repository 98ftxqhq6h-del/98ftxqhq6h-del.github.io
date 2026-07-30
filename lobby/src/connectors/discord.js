import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { askLobby } from '../assistant.js';

export function initDiscord(config) {
  if (!config.discord.enabled || !config.discord.token) {
    console.log("ℹ️ [Discord Bot]: Disabled or missing token.");
    return null;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel] // Needed for DMs
  });

  client.once('ready', () => {
    console.log(`✔ [Discord Bot]: Online as ${client.user.tag}!`);
  });

  client.on('messageCreate', async (message) => {
    // Ignore own messages or other bots
    if (message.author.bot) return;

    const isDM = !message.guild;
    const isMention = client.user && message.mentions.has(client.user);

    if (isDM || isMention) {
      // Show typing indicator
      message.channel.sendTyping();

      // Clean query by removing client mention
      let cleanContent = message.content;
      if (isMention && client.user) {
        cleanContent = cleanContent.replace(`<@${client.user.id}>`, '').trim();
      }

      const reply = await askLobby(cleanContent, `discord-${message.author.id}`);
      await message.reply(reply);
    }
  });

  client.login(config.discord.token).catch((err) => {
    console.error("⚠️ [Discord Bot]: Failed to log in:", err.message);
  });

  return client;
}
