from fastapi import APIRouter
from schemas.chat import ChatRequest, ChatResponse, ProvidersResponse
from services.ai_router import ai_router

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    response, provider, model, latency = await ai_router.chat(
        message=request.message,
        provider=request.provider,
        history=request.conversation_history
    )
    return ChatResponse(
        response=response,
        provider_used=provider,
        model=model,
        latency_ms=latency
    )

@router.post("/providers", response_model=ProvidersResponse)
async def get_providers():
    available = await ai_router.get_available_providers()
    return ProvidersResponse(
        active=ai_router.active_provider,
        available=available
    )
