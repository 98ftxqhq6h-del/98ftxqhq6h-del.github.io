-- ==========================================================================
-- NEXUS AI DESKTOP ASSISTANT — SQLITE SCHEMA
-- ==========================================================================

-- Chat conversations history table
CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    reply TEXT NOT NULL,
    provider TEXT NOT NULL, -- e.g., "ollama", "openai", "xai"
    model TEXT NOT NULL,    -- e.g., "qwen2.5-coder"
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executed terminal commands log table
CREATE TABLE IF NOT EXISTS terminal_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    status TEXT NOT NULL, -- "success", "blocked", "failed", "pending_confirmation"
    output TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Key-value settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- System telemetry status logs table
CREATE TABLE IF NOT EXISTS system_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpu_pct INTEGER NOT NULL,
    ram_gb REAL NOT NULL,
    ollama_state TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
