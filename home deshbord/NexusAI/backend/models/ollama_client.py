import httpx
import logging

logger = logging.getLogger("nexus-backend")

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    async def get_reply(self, prompt: str, model: str = "qwen2.5-coder", system_prompt: str = None) -> str:
        url = f"{self.base_url}/api/chat"
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    raise Exception(f"Ollama returned status: {response.status_code}")
                data = response.json()
                return data["message"]["content"]
        except httpx.ConnectError:
            logger.error("Local Ollama daemon is offline.")
            raise ConnectionError("Ollama daemon offline on port 11434.")
        except Exception as e:
            logger.error(f"Ollama execution exception: {str(e)}")
            raise e
