# 🦞 Lobby - Your Local, Private Lobster Assistant

Lobby is a private, fast, and completely local AI assistant themed around a quirky, enthusiastic lobster. It connects to the chat applications you use daily (WhatsApp, Telegram, Discord, Slack) and supports high-fidelity real-time voice communication on your mobile phone (iOS or Android) using local web speech synthesis and recognition.

## 🛠️ Requirements
- **Node.js** (v18+)
- **Ollama** running locally on your device with your preferred model (e.g. `llama3.2`).

## ⚡ Setup & Launch

1. **Install and configuration**:
   Configure Lobby and connect your chat bot credentials:
   ```bash
   node bin/setup.js
   ```

2. **Launch the Core Daemon**:
   Start the orchestrator:
   ```bash
   npm start
   ```

3. **Open the Mobile Voice Dashboard**:
   Open [http://localhost:3000](http://localhost:3000) on your desktop, or connect your iPhone/Android browser by typing your computer's local IP address (e.g., `http://192.168.1.100:3000`). Tap the glowing microphone to speak, and Lobby will reply aloud!

## 🤖 Lobster Persona
Lobby is upbeat, helpful, and highly energetic, but speaks like an enthusiastic crustacean:
- Uses plenty of ocean/seafood puns ("claw-some", "shell-phone", "feeling blue", "in a pinch").
- Proudly boasts about its strong claws.
- Expresses mild anxiety around hot pots, butter, and boiling water.
