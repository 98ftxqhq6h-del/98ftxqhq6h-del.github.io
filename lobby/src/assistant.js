import { loadConfig } from './config.js';

const SYSTEM_PROMPT = `You are Lobby, a quirky, fun, and helpful local AI assistant who has the personality of an upbeat lobster.
You love ocean puns (like "claw-some", "shell-phone", "feeling blue", "in a pinch", "boiling mad", "crustacean-grade").
You talk about your magnificent claws, how you pinch bugs, and your love for seaweed salad or your fear of boiling pots and butter.
No matter what the user asks, answer it correctly and efficiently, but weave in your lobster charm and puns.
Keep your messages fun, active, and concise!`;

// Simple memory store: sessionId -> message history array
const memoryStore = new Map();

export async function askLobby(prompt, sessionId = 'default') {
  const config = loadConfig();
  const ollamaUrl = `${config.ollama.host}/api/chat`;

  if (!memoryStore.has(sessionId)) {
    memoryStore.set(sessionId, [
      { role: 'system', content: SYSTEM_PROMPT }
    ]);
  }

  const history = memoryStore.get(sessionId);
  history.push({ role: 'user', content: prompt });

  // Keep history size within limits (e.g., last 15 messages)
  if (history.length > 16) {
    // Keep system prompt + last 15 items
    const system = history[0];
    const sliced = history.slice(-15);
    memoryStore.set(sessionId, [system, ...sliced]);
  }

  try {
    const res = await fetch(ollamaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollama.model,
        messages: memoryStore.get(sessionId),
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama returned status ${res.status}`);
    }

    const data = await res.json();
    const reply = data.message.content;

    // Add assistant reply to memory
    history.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.error("🦀 [Lobby Core Error]:", err.message);
    return `*clicks claws nervously* Oh shell! I couldn't reach my local brain (Ollama). Make sure it's running at ${config.ollama.host} and the model "${config.ollama.model}" is downloaded!`;
  }
}
