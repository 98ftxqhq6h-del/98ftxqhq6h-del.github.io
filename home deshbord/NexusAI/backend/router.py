import re
import logging
from backend.models.ollama_client import OllamaClient
from backend.models.openai_client import OpenAIClient
from backend.models.xai_client import XAIClient

logger = logging.getLogger("nexus-backend")

class CommandRouter:
    def __init__(self, config: dict):
        self.config = config
        self.ollama = OllamaClient(base_url=config.get("ollama_url", "http://localhost:11434"))
        self.openai = OpenAIClient(enabled=config.get("use_openai", False))
        self.xai = XAIClient(enabled=config.get("use_xai", False))
        
        self.default_model = config.get("default_model", "qwen2.5-coder")

    def classify_intent(self, text: str) -> str:
        t = text.lower().strip()
        
        # 1. Market Query
        if any(re.search(kw, t) for kw in [r"\bnifty\b", r"\bmarket\b", r"\bstock\b", r"\bticker\b", r"\bcrypto\b", r"\bsentiment\b"]):
            return "market_query"
        # 2. GitHub Query
        if any(re.search(kw, t) for kw in [r"\bgithub\b", r"\bgit\b", r"\brepo\b", r"\bcommit\b", r"\bpush\b"]):
            return "github_action"
        # 3. Telegram Messaging
        if any(re.search(kw, t) for kw in [r"\btelegram\b", r"\balert\b", r"\bnotify\b"]):
            return "telegram_send"
        # 4. Terminal Command
        if any(re.search(kw, t) for kw in [r"\brun\b", r"\bterminal\b", r"\bcommand\b", r"\bexec\b", r"\bvs code\b", r"\bvscode\b"]):
            return "system_command"
            
        return "general_chat"

    async def execute_llm_route(self, text: str, intent: str, provider_override: str = None) -> tuple:
        """
        Routes general chat requests based on capabilities and toggles.
        """
        model_used = f"ollama/{self.default_model}"
        provider = provider_override or "ollama"
        
        try:
            if provider == "openai" or "openai" in text.lower():
                reply = await self.openai.get_reply(text)
                model_used = "openai/gpt-4o-mini"
            elif provider == "xai" or "grok" in text.lower():
                reply = await self.xai.get_reply(text)
                model_used = "xai/grok-beta"
            else:
                # Default Ollama
                system_prompt = "You are Nexus, a helpful, intelligent and concise local AI co-pilot. Keep replies short (1-2 sentences)."
                reply = await self.ollama.get_reply(text, model=self.default_model, system_prompt=system_prompt)
                model_used = f"ollama/{self.default_model}"
        except ConnectionError as e:
            # Fallback Escalation on Ollama Offlines
            logger.warning("Local Ollama connection failed. evaluating paid fallbacks...")
            if self.config.get("use_openai", False):
                reply = await self.openai.get_reply(text)
                model_used = "openai/gpt-4o-mini [Ollama fallback]"
            else:
                raise ConnectionError("Ollama offline and no cloud fallbacks enabled.")
                
        return reply, model_used
