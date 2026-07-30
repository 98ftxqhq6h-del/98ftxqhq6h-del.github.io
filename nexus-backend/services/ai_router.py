import time
import httpx
import random
import logging
from openai import AsyncOpenAI
from config import settings

logger = logging.getLogger(__name__)

class AIRouter:
    def __init__(self):
        self.total_requests = 0
        self.last_latency = 0.0
        self.active_provider = 'fallback'
        self.active_model = 'none'
        self.FALLBACK_REPLIES = [
            "> SYSTEM WARNING: Quantum neural core offline. Resorting to standard heuristics.",
            "> COGNITIVE SUBROUTINE ERROR: Unable to parse syntax through neural link.",
            "> SYNAPTIC MISFIRE DETECTED. Re-routing through secondary processing nodes...",
            "> CONNECTION LOST. Cybernetic relay out of sync.",
            "> ALERT: Temporal displacement in data stream. Re-calibrating...",
            "> SYSTEM MESSAGE: The neural mesh is currently experiencing heavy load. Expect delays.",
            "> WARNING: Unauthorized access attempt blocked by quantum firewall.",
            "> ERROR 0x7F: Cognitive matrix overloaded. Try again later."
        ]
    
    async def check_ollama(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.get(f"{settings.ollama_host}/api/tags")
                return response.status_code == 200
        except Exception:
            return False

    async def check_openai(self) -> bool:
        return bool(settings.openai_api_key)
    
    async def check_xai(self) -> bool:
        return bool(settings.xai_api_key)
    
    async def get_available_providers(self) -> list[str]:
        available = []
        if await self.check_ollama():
            available.append("ollama")
        if await self.check_openai():
            available.append("openai")
        if await self.check_xai():
            available.append("xai")
        return available

    def get_fallback_reply(self) -> str:
        return random.choice(self.FALLBACK_REPLIES)

    async def chat(self, message: str, provider: str = 'auto', history: list = []) -> tuple[str, str, str, float]:
        start_time = time.time()
        providers_to_try = []
        
        if provider == 'auto':
            providers_to_try = ["ollama", "openai", "xai", "fallback"]
        else:
            providers_to_try = [provider, "fallback"]
            
        response_text = ""
        used_provider = "fallback"
        used_model = "none"
        
        messages = [{"role": "system", "content": settings.system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": message})
        
        for p in providers_to_try:
            try:
                if p == "ollama":
                    if not await self.check_ollama():
                        continue
                    client = AsyncOpenAI(base_url=f"{settings.ollama_host}/v1", api_key="ollama")
                    used_model = "llama3.1"
                    response = await client.chat.completions.create(
                        model=used_model,
                        messages=messages,
                        max_tokens=500
                    )
                    response_text = response.choices[0].message.content
                    used_provider = "ollama"
                    break
                
                elif p == "openai":
                    if not await self.check_openai():
                        continue
                    client = AsyncOpenAI(api_key=settings.openai_api_key)
                    used_model = "gpt-4o-mini"
                    response = await client.chat.completions.create(
                        model=used_model,
                        messages=messages,
                        max_tokens=500
                    )
                    response_text = response.choices[0].message.content
                    used_provider = "openai"
                    break
                    
                elif p == "xai":
                    if not await self.check_xai():
                        continue
                    client = AsyncOpenAI(base_url="https://api.x.ai/v1", api_key=settings.xai_api_key)
                    used_model = "grok-3-mini"
                    response = await client.chat.completions.create(
                        model=used_model,
                        messages=messages,
                        max_tokens=500
                    )
                    response_text = response.choices[0].message.content
                    used_provider = "xai"
                    break
                    
                elif p == "fallback":
                    response_text = self.get_fallback_reply()
                    used_provider = "fallback"
                    used_model = "none"
                    break
            except Exception as e:
                logger.error(f"Error with provider {p}: {str(e)}")
                continue
                
        latency = (time.time() - start_time) * 1000
        
        self.total_requests += 1
        self.last_latency = latency
        self.active_provider = used_provider
        self.active_model = used_model
        
        return response_text, used_provider, used_model, latency

ai_router = AIRouter()
