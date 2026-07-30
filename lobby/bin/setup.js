import readline from 'readline';
import { loadConfig, saveConfig } from '../src/config.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

// ANSI Colors for lobster branding
const red = (str) => `\x1b[31m${str}\x1b[0m`;
const boldRed = (str) => `\x1b[1;31m${str}\x1b[0m`;
const cyan = (str) => `\x1b[36m${str}\x1b[0m`;
const green = (str) => `\x1b[32m${str}\x1b[0m`;
const yellow = (str) => `\x1b[33m${str}\x1b[0m`;

async function runSetup() {
  console.log("\n" + boldRed("===================================================="));
  console.log(boldRed("      🦀 WELCOME TO THE LOBBY AI SETUP WIZARD 🦀    "));
  console.log(boldRed("===================================================="));
  console.log("Let's configure your local, private, shell-phone assistant!\n");

  const config = loadConfig();

  // 1. Ollama Configuration
  console.log(cyan("--- [1] OLLAMA ENGINE CONFIGURATION ---"));
  const ollamaHost = await askQuestion(`Ollama URL [default: ${config.ollama.host}]: `);
  if (ollamaHost) config.ollama.host = ollamaHost;

  console.log(`Checking Ollama connection to ${config.ollama.host}...`);
  let models = [];
  try {
    const res = await fetch(`${config.ollama.host}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      models = data.models || [];
      console.log(green("✔ Connected successfully to Ollama!"));
    }
  } catch (err) {
    console.log(yellow("⚠️ Could not connect to Ollama. Make sure Ollama app is open and running."));
  }

  if (models.length > 0) {
    console.log("\nAvailable local models:");
    models.forEach((m, idx) => console.log(`  [${idx + 1}] ${m.name}`));
    const modelSelection = await askQuestion(`Select a model number (1-${models.length}) [default model: ${config.ollama.model}]: `);
    const selectedIdx = parseInt(modelSelection, 10) - 1;
    if (selectedIdx >= 0 && selectedIdx < models.length) {
      config.ollama.model = models[selectedIdx].name;
      console.log(green(`✔ Set model to ${config.ollama.model}`));
    }
  } else {
    const customModel = await askQuestion(`Enter Ollama model to use [default: ${config.ollama.model}]: `);
    if (customModel) config.ollama.model = customModel;
  }

  // 2. Chat Apps
  console.log("\n" + cyan("--- [2] CHAT APP INTEGRATIONS ---"));

  // WhatsApp
  console.log(`\n${boldRed("WhatsApp")}: Run WhatsApp bot completely locally via web automation.`);
  const useWA = await askQuestion("Enable WhatsApp? (y/n) [default: n]: ");
  config.whatsapp.enabled = (useWA.toLowerCase() === 'y' || useWA.toLowerCase() === 'yes');

  // Telegram
  console.log(`\n${boldRed("Telegram")}: Connect a bot using a token from @BotFather.`);
  const useTG = await askQuestion("Enable Telegram? (y/n) [default: n]: ");
  if (useTG.toLowerCase() === 'y' || useTG.toLowerCase() === 'yes') {
    config.telegram.enabled = true;
    const token = await askQuestion("Enter your Telegram Bot Token: ");
    if (token) config.telegram.token = token;
  } else {
    config.telegram.enabled = false;
  }

  // Discord
  console.log(`\n${boldRed("Discord")}: Connect using a Discord Bot Token.`);
  const useDC = await askQuestion("Enable Discord? (y/n) [default: n]: ");
  if (useDC.toLowerCase() === 'y' || useDC.toLowerCase() === 'yes') {
    config.discord.enabled = true;
    const token = await askQuestion("Enter your Discord Bot Token: ");
    if (token) config.discord.token = token;
  } else {
    config.discord.enabled = false;
  }

  // Slack
  console.log(`\n${boldRed("Slack")}: Connect using Slack Socket Mode (Bot Token + App-Level Token).`);
  const useSL = await askQuestion("Enable Slack? (y/n) [default: n]: ");
  if (useSL.toLowerCase() === 'y' || useSL.toLowerCase() === 'yes') {
    config.slack.enabled = true;
    const botToken = await askQuestion("Enter Slack Bot User OAuth Token (xoxb-...): ");
    const appToken = await askQuestion("Enter Slack App-Level Token (xapp-...): ");
    if (botToken) config.slack.token = botToken;
    if (appToken) config.slack.appToken = appToken;
  } else {
    config.slack.enabled = false;
  }

  // 3. Web UI / Mobile Voice Port
  console.log("\n" + cyan("--- [3] VOICE PORTAL & DASHBOARD ---"));
  const webPort = await askQuestion(`Web Server Port [default: ${config.web.port}]: `);
  if (webPort) config.web.port = parseInt(webPort, 10) || config.web.port;

  // Save config
  saveConfig(config);
  console.log("\n" + boldRed("===================================================="));
  console.log(green("✨ Setup Configuration Saved Successfully! ✨"));
  console.log(boldRed("===================================================="));
  console.log("You are ready to summon Lobby, the lobster!");
  console.log(`Run: ${cyan("npm start")} to start the assistant daemon.`);
  console.log("====================================================\n");

  rl.close();
}

runSetup();
