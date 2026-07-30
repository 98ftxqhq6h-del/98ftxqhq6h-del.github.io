import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';
import { askLobby } from '../assistant.js';

export function initSlack(config) {
  if (!config.slack.enabled || !config.slack.token || !config.slack.appToken) {
    console.log("ℹ️ [Slack Bot]: Disabled or missing token/appToken.");
    return null;
  }

  const webClient = new WebClient(config.slack.token);
  const socketClient = new SocketModeClient({
    appToken: config.slack.appToken
  });

  socketClient.on('message', async ({ event, ack }) => {
    await ack();

    // Check if message event, not from a bot, and has text
    if (event.type === 'message' && !event.bot_id && event.text) {
      // Check if it is a Direct Message channel
      const isIM = event.channel_type === 'im' || event.channel.startsWith('D');

      if (isIM) {
        try {
          const reply = await askLobby(event.text, `slack-${event.user}`);
          await webClient.chat.postMessage({
            channel: event.channel,
            text: reply
          });
        } catch (err) {
          console.error("Slack postMessage error:", err.message);
        }
      }
    }
  });

  // Handle app mentions in channels
  socketClient.on('app_mention', async ({ event, ack }) => {
    await ack();

    if (event.text) {
      try {
        const cleanText = event.text.replace(/<@[A-Z0-9]+>/g, '').trim();
        const reply = await askLobby(cleanText, `slack-${event.user}`);
        await webClient.chat.postMessage({
          channel: event.channel,
          text: `<@${event.user}> ${reply}`
        });
      } catch (err) {
        console.error("Slack app_mention reply error:", err.message);
      }
    }
  });

  socketClient.start()
    .then(() => console.log("✔ [Slack Bot]: Socket Mode connected!"))
    .catch((err) => console.error("⚠️ [Slack Bot]: Failed to start:", err.message));

  return { webClient, socketClient };
}
