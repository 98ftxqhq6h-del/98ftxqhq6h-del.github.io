import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from schemas.chat import SystemStatus
from services.system_stats import get_system_status
from services.ai_router import ai_router

router = APIRouter(tags=["Neural"])

@router.get("/api/neural/status", response_model=SystemStatus)
async def neural_status():
    return get_system_status(ai_router)

@router.websocket("/ws/stats")
async def websocket_stats(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            stats = get_system_status(ai_router)
            await websocket.send_json(stats.model_dump())
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
