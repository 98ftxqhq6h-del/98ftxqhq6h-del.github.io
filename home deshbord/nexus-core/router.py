import re
import logging
from models.ollama_client import OllamaClient
from models.openai_client import OpenAIClient
from models.xai_client import XAIClient

logger = logging.getLogger("nexus-core")

class CommandRouter:
    def __init__(self, config: dict):
        self.config = config
        
        # Initialize LLM Clients
        self.ollama = OllamaClient(base_url=config.get("ollama_url", "http://localhost:11434"))
        self.openai = OpenAIClient(enabled=config.get("use_openai", False))
        self.xai = XAIClient(enabled=config.get("use_xai", False))
        
        self.default_model = config.get("default_model", "qwen2.5-coder")

    def classify_intent(self, text: str) -> str:
        """
        Classifies incoming voice/text input using regular expressions.
        """
        t = text.lower().strip()
        
        # 1. Market Pulse Query
        market_keywords = [
            r"\bnifty\b", r"\bsentiment\b", r"\bmarket\b", r"\bstock\b",
            r"\bshares\b", r"\baapl\b", r"\bnvda\b", r"\btsla\b", r"\bbtc\b",
            r"\bticker\b"
        ]
        if any(re.search(kw, t) for kw in market_keywords):
            return "market_query"
            
        # 2. GitHub Integration Action
        github_keywords = [
            r"\bgithub\b", r"\bgit\b", r"\brepo\b", r"\bcommit\b",
            r"\bpush\b", r"\bpull request\b", r"\bworkflow\b", r"\bci\b",
            r"\bvscode\b", r"\bvs code\b"
        ]
        if any(re.search(kw, t) for kw in github_keywords):
            return "github_action"
            
        # 3. Telegram Messaging Action
        telegram_keywords = [
            r"\btelegram\b", r"\bphone alert\b", r"\balert phone\b",
            r"\bnotify\b", r"\bmessage me\b", r"\btelegram bot\b"
        ]
        if any(re.search(kw, t) for kw in telegram_keywords):
            return "telegram_send"
            
        # 4. System Diagnostics
        system_keywords = [
            r"\bsystem\b", r"\bmodel\b", r"\bconda\b", r"\bcpu\b", r"\bram\b",
            r"\bdiagnostics\b", r"\bhardware\b"
        ]
        if any(re.search(kw, t) for kw in system_keywords):
            return "system_command"
            
        # 5. Fallback General Chat
        return "general_chat"

    async def route_and_execute(self, text: str, intent: str, user_preference: str = None) -> tuple:
        """
        Routes the command to the correct model client or action trigger.
        Returns: (reply_text, model_used, action_taken)
        """
        model_used = "local-execution"
        action_taken = "none"
        
        # User specified cloud models explicitly (e.g. "ask openai: ...")
        force_openai = "openai" in text.lower() or (user_preference and user_preference.lower() == "openai")
        force_xai = "grok" in text.lower() or "xai" in text.lower() or (user_preference and user_preference.lower() == "xai")
        
        # 1. Resolve LLM client mapping based on toggles and preferences
        try:
            if force_openai:
                reply = await self.openai.get_reply(text)
                model_used = "openai/gpt-4o-mini"
            elif force_xai:
                reply = await self.xai.get_reply(text)
                model_used = "xai/grok-beta"
            else:
                # Default: Ollama Local Routing
                model_used = f"ollama/{self.default_model}"
                system_prompt = "You are Nexus, a helpful, intelligent and concise local AI co-pilot. Keep replies short (1-2 sentences)."
                
                # Check for Hinglish triggers in general chat
                if any(x in text.lower() for x in ["kaise", "kya", "bhai", "yaar", "namaste", "tum"]):
                    system_prompt += " Reply in a natural, casual Hinglish (Hindi + English) tone."
                    
                reply = await self.ollama.get_reply(text, model=self.default_model, system_prompt=system_prompt)
                
        except ConnectionError as e:
            # Fallback Escalation on Local Ollama Failure
            logger.warning("Local Ollama connection failed. Evaluating paid fallbacks...")
            
            if self.config.get("use_openai", False):
                logger.info("Escalating to OpenAI fallback automatically since it is enabled.")
                reply = await self.openai.get_reply(text)
                model_used = "openai/gpt-4o-mini [Ollama fallback]"
            elif self.config.get("use_xai", False):
                logger.info("Escalating to xAI fallback automatically since it is enabled.")
                reply = await self.xai.get_reply(text)
                model_used = "xai/grok-beta [Ollama fallback]"
            else:
                raise ConnectionError("Local Ollama is offline and no cloud fallbacks are enabled in config.yaml.")
                
        return reply, model_used, action_taken
