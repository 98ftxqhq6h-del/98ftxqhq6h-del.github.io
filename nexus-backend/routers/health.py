from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0", "name": "NEXUS AI Backend"}
