import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../config.json');

const DEFAULT_CONFIG = {
  ollama: {
    host: "http://localhost:11434",
    model: "llama3.2"
  },
  telegram: {
    enabled: false,
    token: ""
  },
  discord: {
    enabled: false,
    token: "",
    clientId: ""
  },
  slack: {
    enabled: false,
    token: "",
    appToken: ""
  },
  whatsapp: {
    enabled: false
  },
  web: {
    port: 3000,
    host: "0.0.0.0"
  }
};

export function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error("⚠️ Failed to load config, using defaults:", err.message);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("⚠️ Failed to save config:", err.message);
    return false;
  }
}
