import httpx
import os
import logging

logger = logging.getLogger("nexus-telegram-bot")

class TelegramBot:
    def __init__(self, token: str = None, chat_id: str = None, enabled: bool = True):
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
        self.enabled = enabled
        self.simulated = not self.token or "your_telegram_bot" in self.token

    def check_status(self) -> str:
        if not self.enabled:
            return "DISABLED"
        return "SIMULATION" if self.simulated else "ACTIVE"

    async def send_alert(self, text: str) -> bool:
        if not self.enabled:
            return False
        if self.simulated:
            logger.info(f"Telegram [SIMULATED] Notification: '{text}'")
            return True
            
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {"chat_id": self.chat_id, "text": f"🛡️ [NEXUS AI OS]\n{text}", "parse_mode": "HTML"}
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Telegram push error: {str(e)}")
            return False

    async def reply_to_sender(self, chat_id: str, text: str) -> bool:
        if not self.enabled or self.simulated:
            logger.info(f"Telegram [SIMULATED] Reply to Chat {chat_id}: '{text}'")
            return True
            
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {"chat_id": chat_id, "text": text}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Telegram reply error: {str(e)}")
            return False
