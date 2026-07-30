import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger("nexus-backend")

class DBHelper:
    def __init__(self, db_dir: str = "database"):
        self.db_path = os.path.join(db_dir, "nexus_ai.db")
        os.makedirs(db_dir, exist_ok=True)
        self.init_db(db_dir)

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self, db_dir):
        """Loads and runs schema.sql if database is uninitialized."""
        schema_path = os.path.join(db_dir, "schema.sql")
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                if os.path.exists(schema_path):
                    with open(schema_path, "r") as f:
                        schema_sql = f.read()
                    cursor.executescript(schema_sql)
                    conn.commit()
                    logger.info("SQLite database tables initialized successfully.")
                else:
                    # Fallback creation in case file is read-missing
                    cursor.execute("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);")
                    conn.commit()
        except Exception as e:
            logger.error(f"SQLite initialization exception: {str(e)}")
            raise e

    # --- CHAT METHODS ---
    def log_chat(self, prompt: str, reply: str, provider: str, model: str):
        query = "INSERT INTO chats (prompt, reply, provider, model) VALUES (?, ?, ?, ?);"
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (prompt, reply, provider, model))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to insert chat log: {str(e)}")

    def get_chats(self, limit: int = 50) -> list:
        query = "SELECT id, prompt, reply, provider, model, timestamp FROM chats ORDER BY id DESC LIMIT ?;"
        try:
            with self.get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(query, (limit,))
                rows = cursor.fetchall()
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Failed to fetch chat logs: {str(e)}")
            return []

    # --- TERMINAL METHODS ---
    def log_terminal(self, command: str, status: str, output: str = None):
        query = "INSERT INTO terminal_logs (command, status, output) VALUES (?, ?, ?);"
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (command, status, output))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to log terminal execution: {str(e)}")

    def get_terminal_logs(self, limit: int = 50) -> list:
        query = "SELECT id, command, status, output, timestamp FROM terminal_logs ORDER BY id DESC LIMIT ?;"
        try:
            with self.get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(query, (limit,))
                rows = cursor.fetchall()
                return [dict(r) for r in rows]
        except Exception as e:
            logger.error(f"Failed to fetch terminal logs: {str(e)}")
            return []

    # --- PREFERENCES SETTINGS ---
    def get_setting(self, key: str, default: str = None) -> str:
        query = "SELECT value FROM settings WHERE key = ?;"
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (key,))
                row = cursor.fetchone()
                return row[0] if row else default
        except Exception:
            return default

    def set_setting(self, key: str, value: str):
        query = "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);"
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (key, value))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to write setting: {str(e)}")

    # --- TELEMETRY LOGS ---
    def log_telemetry(self, cpu: int, ram: float, ollama_state: str):
        query = "INSERT INTO system_status (cpu_pct, ram_gb, ollama_state) VALUES (?, ?, ?);"
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (cpu, ram, ollama_state))
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to log telemetry: {str(e)}")
