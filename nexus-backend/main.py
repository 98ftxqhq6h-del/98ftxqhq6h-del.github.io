from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.health import router as health_router
from routers.chat import router as chat_router
from routers.neural import router as neural_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NEXUS AI",
    version="1.0.0",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(neural_router)

@app.on_event("startup")
async def startup_event():
    logger.info("NEXUS NEURAL CORE: ONLINE")
