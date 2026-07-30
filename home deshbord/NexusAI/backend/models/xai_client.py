import httpx
import logging
import os

logger = logging.getLogger("nexus-backend")

class XAIClient:
    def __init__(self, api_key: str = None, enabled: bool = False):
        self.api_key = api_key or os.getenv("XAI_API_KEY")
        self.enabled = enabled

    async def get_reply(self, prompt: str, model: str = "grok-beta") -> str:
        if not self.enabled:
            raise PermissionError("xAI API is disabled in config.yaml.")
        if not self.api_key or "your_xai_api_key" in self.api_key:
            raise ValueError("xAI API key missing in environment .env file.")
            
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code != 200:
                raise Exception(f"xAI returned error: {response.text}")
            data = response.json()
            return data["choices"][0]["message"]["content"]
