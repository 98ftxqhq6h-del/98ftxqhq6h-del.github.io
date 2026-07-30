import sqlite3
import os
import logging
from datetime import datetime

logger = logging.getLogger("nexus-core")

class HistoryDB:
    def __init__(self, db_dir: str = "db"):
        self.db_path = os.path.join(db_dir, "history.db")
        # Ensure directories exist
        os.makedirs(db_dir, exist_ok=True)
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def init_db(self):
        """
        Creates the history table if it doesn't already exist.
        """
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS command_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_text TEXT NOT NULL,
            source TEXT NOT NULL,
            reply TEXT,
            source_model TEXT,
            action_taken TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(create_table_sql)
                conn.commit()
            logger.info(f"SQLite Command History DB initialized at {self.db_path}")
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise e

    def log_command(self, input_text: str, source: str, reply: str, source_model: str, action_taken: str) -> int:
        """
        Logs a command sequence to the SQLite database.
        """
        insert_sql = """
        INSERT INTO command_history (input_text, source, reply, source_model, action_taken, timestamp)
        VALUES (?, ?, ?, ?, ?, ?);
        """
        timestamp = datetime.now().isoformat()
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(insert_sql, (input_text, source, reply, source_model, action_taken, timestamp))
                conn.commit()
                row_id = cursor.lastrowid
                logger.info(f"Logged command ID {row_id} to DB.")
                return row_id
        except Exception as e:
            logger.error(f"Failed to log command to SQLite: {str(e)}")
            return -1

    def fetch_history(self, limit: int = 50) -> list:
        """
        Fetches latest command history.
        """
        select_sql = """
        SELECT id, input_text, source, reply, source_model, action_taken, timestamp
        FROM command_history
        ORDER BY id DESC
        LIMIT ?;
        """
        try:
            with self.get_connection() as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(select_sql, (limit,))
                rows = cursor.fetchall()
                
                history_list = []
                for row in rows:
                    history_list.append({
                        "id": row["id"],
                        "input_text": row["input_text"],
                        "source": row["source"],
                        "reply": row["reply"],
                        "source_model": row["source_model"],
                        "action_taken": row["action_taken"],
                        "timestamp": row["timestamp"]
                    })
                return history_list
        except Exception as e:
            logger.error(f"Failed to fetch SQLite history: {str(e)}")
            return []
            
    def clear_history(self) -> bool:
        """
        Clears the log history table.
        """
        delete_sql = "DELETE FROM command_history;"
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(delete_sql)
                conn.commit()
            logger.info("Cleared all rows in command_history.")
            return True
        except Exception as e:
            logger.error(f"Failed to clear history table: {str(e)}")
            return False
