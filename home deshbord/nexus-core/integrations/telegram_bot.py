import httpx
import os
import logging

logger = logging.getLogger("nexus-core")

class TelegramBot:
    def __init__(self, token: str = None, chat_id: str = None, enabled: bool = True):
        self.token = token or os.getenv("TELEGRAM_BOT_TOKEN")
        self.chat_id = chat_id or os.getenv("TELEGRAM_CHAT_ID")
        self.enabled = enabled
        
        # Check if running in simulation mode
        self.simulated = not self.token or "your_telegram_bot" in self.token

    def check_status(self) -> str:
        if not self.enabled:
            return "DISABLED"
        return "SIMULATION" if self.simulated else "ACTIVE"

    async def send_alert(self, text: str) -> bool:
        """
        Pushes a notification text to the configured chat_id.
        """
        if not self.enabled:
            logger.info("Telegram notification suppressed: Integration disabled.")
            return False
            
        if self.simulated:
            logger.info(f"Telegram Bot Client [SIMULATION] alert sent: '{text}'")
            return True
            
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {
            "chat_id": self.chat_id,
            "text": f"🛡️ [NEXUS ALERTS]\n{text}",
            "parse_mode": "HTML"
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    logger.info("Telegram notification push alert successful.")
                    return True
                else:
                    logger.error(f"Telegram API returned status {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            logger.error(f"Telegram send exception: {str(e)}")
            return False

    async def process_webhook_update(self, update: dict) -> dict:
        """
        Parses incoming updates from Telegram webhook (2-way command relay).
        """
        if not self.enabled:
            return {"status": "ignored", "message": "Bot is disabled."}
            
        # Parse text command from incoming Telegram message update
        message = update.get("message", {})
        chat = message.get("chat", {})
        sender_chat_id = chat.get("id")
        text = message.get("text", "")
        
        if not text or not sender_chat_id:
            return {"status": "ignored", "message": "No valid message body found."}
            
        logger.info(f"Incoming Telegram message from Chat ID {sender_chat_id}: '{text}'")
        
        return {
            "status": "success",
            "chat_id": sender_chat_id,
            "command_text": text
        }
        
    async def reply_to_sender(self, sender_chat_id: str, text: str) -> bool:
        """
        Replies back to a specific sender chat ID.
        """
        if not self.enabled or self.simulated:
            logger.info(f"Telegram Bot [SIMULATION] reply to Chat ID {sender_chat_id}: '{text}'")
            return True
            
        url = f"https://api.telegram.org/bot{self.token}/sendMessage"
        payload = {
            "chat_id": sender_chat_id,
            "text": text
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Telegram send reply exception: {str(e)}")
            return False
