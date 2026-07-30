# 📑 Nexus AI REST API Reference Documentation

All core actions communicate via HTTP REST endpoints served by the FastAPI backend on **Port 8000** (`http://127.0.0.1:8000`).

---

## 💬 1. Chat Completion Endpoint
* **Endpoint:** `POST /chat`
* **Description:** Routes prompt queries to local LLM engines (Ollama) or cloud providers based on fallback rules.
* **Request Payload (`application/json`):**
  ```json
  {
    "prompt": "explain local inference optimization",
    "provider": "ollama",
    "context": "optional context string"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "reply": "Local inference optimization relies on compiling model weights to native CPU/GPU backends (e.g. Metal on Apple Silicon) to minimize latency...",
    "provider": "ollama",
    "model": "ollama/qwen2.5-coder",
    "timestamp": "2026-07-14T00:05:12.381"
  }
  ```

---

## 🎙️ 2. Voice Transcription Endpoint
* **Endpoint:** `POST /voice`
* **Description:** Receives binary WAV audio captures, transcribes them using Whisper, and executes the transcribed prompt as a command. Supports mock testing via URL form values.
* **Request Parameters (`multipart/form-data` or `x-www-form-urlencoded`):**
  - `audio`: File (binary capture)
  - `simulated_voice_text`: String (optional command string bypass)
* **Success Response (200 OK):**
  ```json
  {
    "transcription": "Hey Nexus, check Nifty sentiment",
    "reply": "Market Sentiment is BULLISH (72%). Tickers AAPL and NVDA are trending upwards...",
    "model": "ollama/qwen2.5-coder",
    "timestamp": "2026-07-14T00:06:40.119"
  }
  ```

---

## 🖥️ 3. Safe Terminal Execute
* **Endpoint:** `POST /terminal`
* **Description:** Executes command strings using shell subprocess layers. Dangerous prefixes (`sudo`, `rm -rf`) are blocked or require verification flag.
* **Request Payload (`application/json`):**
  ```json
  {
    "command": "git status",
    "confirm": false
  }
  ```
* **Response (Safe Execute - 200 OK):**
  ```json
  {
    "status": "success",
    "output": "On branch main\nYour branch is up to date...\nnothing to commit, working tree clean",
    "returncode": 0
  }
  ```
* **Response (Dangerous command warning):**
  ```json
  {
    "status": "warning",
    "message": "DANGEROUS COMMAND DETECTED. Please confirm execution.",
    "command": "rm -rf build",
    "requires_confirmation": true
  }
  ```

---

## 🐙 4. GitHub Operations
* **Endpoint:** `POST /github`
* **Description:** Triggers Personal Access Token action suites.
* **Request Payload (`application/json`):**
  ```json
  {
    "action": "create_repo",
    "details": {
      "name": "nexus-new-widget",
      "private": true
    }
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "url": "https://github.com/anurag/nexus-new-widget",
    "message": "Repository 'nexus-new-widget' created."
  }
  ```

---

## 📢 5. Telegram Dispatcher
* **Endpoint:** `POST /telegram`
* **Description:** Pushes status updates to Telegram bot relays.
* **Request Payload (`application/json`):**
  ```json
  {
    "message": "Nifty index breached 24,000 range!"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success"
  }
  ```

---

## 📈 6. Market Telemetry Monitor
* **Endpoint:** `GET /market`
* **Description:** Returns market tickers status and sentiment indicators.
* **Query Parameters:**
  - `crashed` (boolean, default: false) — toggles simulated market crashes.
* **Success Response (200 OK):**
  ```json
  {
    "sentiment_index": "72%",
    "condition": "BULLISH",
    "volume_trend": "GROWING",
    "headlines": [
      "AI stocks rally on hardware releases."
    ],
    "watchlist": {
      "AAPL": { "price": 189.42, "change": 1.24, "indicator": "RSI: Neutral" }
    }
  }
  ```

---

## 🧠 7. Memory DB Sync
* **Endpoint:** `GET /memory`
* **Description:** Fetches historical tables from the SQLite database.
* **Success Response (200 OK):**
  ```json
  {
    "chat_history": [
      { "id": 1, "prompt": "test", "reply": "resp", "provider": "ollama", "model": "qwen2.5-coder" }
    ],
    "terminal_logs": [
      { "id": 1, "command": "ls", "status": "success", "output": "README.md" }
    ]
  }
  ```

---

## 🔧 8. Configuration Settings
* **Endpoint:** `GET /settings` & `POST /settings`
* **Description:** Gets or saves user preference variables into SQLite.
