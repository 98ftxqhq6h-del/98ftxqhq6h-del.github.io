from pydantic import BaseModel, Field
from typing import Literal, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    provider: Literal['auto', 'ollama', 'openai', 'xai'] = 'auto'
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)

class ChatResponse(BaseModel):
    response: str
    provider_used: str
    model: str
    latency_ms: float

class SystemStatus(BaseModel):
    cpu_percent: float
    memory_percent: float
    memory_used_gb: float
    uptime_seconds: float
    active_provider: str
    active_model: str
    total_requests: int
    latency_ms: float = 0.0

class ProvidersResponse(BaseModel):
    active: str
    available: List[str]
