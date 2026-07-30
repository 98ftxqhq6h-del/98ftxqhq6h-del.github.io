import os
import sys
import yaml
import logging
import subprocess
from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Append parent directory to sys.path to enable imports of siblings (database, integrations, etc.)
PARENT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(PARENT_DIR)

# Import Neighboring Components
from database.db_helper import DBHelper
from backend.router import CommandRouter
from github_agent.github_client import GitHubAgent
from telegram_bot.telegram_client import TelegramBot
from market_brain.market_pulse import MarketBrain
from voice.whisper_stt import WhisperSTT

# --- SYSTEM INIT ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-backend")

app = FastAPI(
    title="Nexus AI Desktop Backend",
    description="FastAPI Core router supporting chats, terminal triggers, market pulse, and automated integrations.",
    version="2.0.0"
)

# Enable CORS for local Electron/Web frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load configuration parameters
CONFIG_PATH = os.path.join(PARENT_DIR, "config", "config.yaml")
def load_config() -> dict:
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            return yaml.safe_load(f)
    return {}

config = load_config()

# Helper instantiations
db = DBHelper(db_dir=os.path.join(PARENT_DIR, "database"))
router = CommandRouter(config)
github = GitHubAgent(enabled=config.get("github_enabled", True))
telegram = TelegramBot(enabled=config.get("telegram_enabled", True))
market = MarketBrain()
voice = WhisperSTT(enabled=config.get("voice_stt_enabled", True))

# --- REQUEST & RESPONSE MODELS ---
class ChatRequest(BaseModel):
    prompt: str
    provider: str = None # "ollama", "openai", "xai"
    context: str = None

class TerminalRequest(BaseModel):
    command: str
    confirm: bool = False # Dangerous commands confirmation flag

class GithubRequest(BaseModel):
    action: str # "create_repo", "commit_file", "list_issues", "check_ci"
    details: dict

class TelegramRequest(BaseModel):
    message: str

class SettingsRequest(BaseModel):
    key: str
    value: str

# --- ENDPOINTS ---

@app.post("/chat")
async def handle_chat(req: ChatRequest):
    """
    POST /chat - Process chat conversations, route to LLMs, and log to SQLite.
    """
    intent = router.classify_intent(req.prompt)
    logger.info(f"Intent classified: {intent}")
    
    # Execute routing
    try:
        reply, model_used = await router.execute_llm_route(
            text=req.prompt,
            intent=intent,
            provider_override=req.provider
        )
        
        # Log chat to SQLite database
        db.log_chat(
            prompt=req.prompt,
            reply=reply,
            provider=req.provider or "ollama",
            model=model_used
        )
        
        return {
            "reply": reply,
            "provider": req.provider or "ollama",
            "model": model_used,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice")
async def handle_voice(
    audio: UploadFile = File(None),
    simulated_voice_text: str = Form(None)
):
    """
    POST /voice - Receives audio data, transcribes it via Whisper, 
    and handles the resulting string as a prompt.
    """
    try:
        transcribed_text = ""
        if simulated_voice_text:
            transcribed_text = simulated_voice_text
        elif audio:
            # Save audio temporarily
            temp_path = os.path.join(PARENT_DIR, "logs", f"voice_{int(datetime.now().timestamp())}.wav")
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            with open(temp_path, "wb") as buffer:
                buffer.write(await audio.read())
            
            # Transcribe
            transcribed_text = voice.transcribe_audio(temp_path)
            # Remove temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        else:
            raise HTTPException(status_code=400, detail="Audio file or simulation prompt required.")
            
        logger.info(f"Voice Transcription text: '{transcribed_text}'")
        
        # Route the transcribed text through our chat executor
        intent = router.classify_intent(transcribed_text)
        reply, model_used = await router.execute_llm_route(transcribed_text, intent)
        
        # TTS Speak reply if enabled
        if config.get("voice_tts_enabled", False):
            voice.speak_text(reply)
            
        return {
            "transcription": transcribed_text,
            "reply": reply,
            "model": model_used,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/terminal")
async def handle_terminal(req: TerminalRequest):
    """
    POST /terminal - Runs safe terminal command shell triggers, 
    blocking dangerous operations.
    """
    cmd = req.command.strip()
    
    # SECURITY FILTERING
    dangerous_keywords = ["rm -rf", "mkfs", "dd ", "shutdown", "reboot", "format ", "sudo"]
    is_dangerous = any(kw in cmd.lower() for kw in dangerous_keywords)
    
    if is_dangerous and not req.confirm:
        db.log_terminal(cmd, "pending_confirmation")
        return {
            "status": "warning",
            "message": "DANGEROUS COMMAND DETECTED. Please confirm execution.",
            "command": cmd,
            "requires_confirmation": True
        }
        
    if is_dangerous and req.confirm:
        # User confirmed, but block root command execution for safety in backend
        db.log_terminal(cmd, "blocked", "Root commands blocked for workstation protection.")
        return {
            "status": "blocked",
            "message": "Root-level dangerous commands are strictly blocked for security."
        }
        
    try:
        # Run safe subprocess
        # Limit command executions to basic queries for security
        safe_prefixes = ["ls", "pwd", "git status", "git log", "echo", "python --version", "node -v", "code --version"]
        is_safe = any(cmd.startswith(pref) for pref in safe_prefixes) or len(cmd) < 30
        
        if not is_safe:
             db.log_terminal(cmd, "blocked", "Command signature failed safety validator check.")
             return {
                 "status": "blocked",
                 "message": "Command syntax rejected by security guidelines."
             }
             
        process = subprocess.run(cmd, shell=True, text=True, capture_output=True, timeout=5.0)
        output = process.stdout if process.returncode == 0 else process.stderr
        status = "success" if process.returncode == 0 else "failed"
        
        # Log execution outcome
        db.log_terminal(cmd, status, output)
        
        return {
            "status": status,
            "output": output,
            "returncode": process.returncode
        }
    except Exception as e:
        db.log_terminal(cmd, "failed", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/github")
async def handle_github(req: GithubRequest):
    """
    POST /github - Executes repositories commit activities.
    """
    res = await github.execute_action(req.action, req.details)
    return res

@app.post("/telegram")
async def handle_telegram(req: TelegramRequest):
    """
    POST /telegram - Pushes bot alert messaging.
    """
    success = await telegram.send_alert(req.message)
    return {"status": "success" if success else "error"}

@app.get("/market")
async def get_market(crashed: bool = False):
    """
    GET /market - Fetches financial indexes, watchlist updates and news triggers.
    """
    if crashed:
        return market.trigger_bearish_event()
    return market.get_market_analysis()

@app.get("/memory")
async def get_memory(limit: int = 25):
    """
    GET /memory - Returns SQLite logged chat history databases.
    """
    return {
        "chat_history": db.get_chats(limit),
        "terminal_logs": db.get_terminal_logs(limit)
    }

@app.post("/settings")
async def update_settings(req: SettingsRequest):
    """
    POST /settings - Saves dynamic user key-value setups in SQLite.
    """
    db.set_setting(req.key, req.value)
    return {"status": "success", "key": req.key, "value": req.value}

@app.get("/settings")
async def get_settings():
    """
    GET /settings - Fetches the current preferences.
    """
    return {
        "default_model": db.get_setting("default_model", config.get("default_model")),
        "use_openai": db.get_setting("use_openai", "false") == "true",
        "use_xai": db.get_setting("use_xai", "false") == "true",
        "github_status": github.check_status(),
        "telegram_status": telegram.check_status()
    }
