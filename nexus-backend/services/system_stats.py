import time
import psutil
from schemas.chat import SystemStatus

SERVER_START_TIME = time.time()

def get_system_status(ai_router) -> SystemStatus:
    mem = psutil.virtual_memory()
    return SystemStatus(
        cpu_percent=psutil.cpu_percent(interval=0.1),
        memory_percent=mem.percent,
        memory_used_gb=mem.used / (1024 ** 3),
        uptime_seconds=time.time() - SERVER_START_TIME,
        active_provider=ai_router.active_provider,
        active_model=ai_router.active_model,
        total_requests=ai_router.total_requests,
        latency_ms=ai_router.last_latency
    )
