import httpx
import logging

logger = logging.getLogger("nexus-core")

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url

    async def get_reply(self, prompt: str, model: str = "qwen2.5-coder", system_prompt: str = None) -> str:
        """
        Queries the local Ollama /api/chat endpoint.
        """
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
        
        logger.info(f"Routing to local Ollama model: {model}")
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code != 200:
                    raise Exception(f"Ollama server returned error code: {response.status_code}")
                
                data = response.json()
                return data["message"]["content"]
        except httpx.ConnectError:
            logger.error("Failed to connect to local Ollama service. Daemon might be offline.")
            raise ConnectionError("Ollama service offline. Verify local daemon is running on port 11434.")
        except Exception as e:
            logger.error(f"Ollama execution error: {str(e)}")
            raise e
