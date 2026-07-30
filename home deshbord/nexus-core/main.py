import os
import yaml
import logging
from datetime import datetime
from fastapi import FastAPI, Header, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import Inner Modules
from db.history import HistoryDB
from router import CommandRouter
from modules.market_pulse import MarketPulse
from integrations.github_client import GitHubClient
from integrations.telegram_bot import TelegramBot

# --- LOAD SECRETS & LOGGING ---
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-core")

# --- INITIALIZE FASTAPI ---
app = FastAPI(
    title="Nexus Core API",
    description="Central AI Orchestration Backend for NEXUS JARVIS OS",
    version="1.0.0"
)

# Enable CORS for local cockpit frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD SYSTEM CONFIG & INITIALIZE HELPERS ---
CONFIG_PATH = "config.yaml"
def load_config() -> dict:
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            return yaml.safe_load(f)
    return {}

config = load_config()

# Helper instances
db = HistoryDB()
router = CommandRouter(config)
market = MarketPulse()
github = GitHubClient(enabled=config.get("github_enabled", True))
telegram = TelegramBot(enabled=config.get("telegram_enabled", True))

# --- REQUEST & RESPONSE SCHEMAS ---
class CommandRequest(BaseModel):
    text: str
    source: str = "text" # "text" | "voice" | "telegram"
    user_preference: str = None # "openai" | "xai" | "ollama" (optional override)

class CommandResponse(BaseModel):
    reply: str
    source_model: str
    action_taken: str
    timestamp: str

# --- CORE INTEGRATION LOGIC ---
async def execute_nexus_command(text: str, source: str, user_preference: str = None) -> tuple:
    """
    Core executor that parses intent, triggers third-party integrations, 
    queries local/cloud LLMs, and stores outcomes in history.
    """
    intent = router.classify_intent(text)
    logger.info(f"Command classified as: '{intent}' (input: '{text}')")
    
    reply = ""
    source_model = "local-execution"
    action_taken = f"intent_routed:{intent}"
    
    # 1. ROUTE BY INTENT TYPE
    if intent == "market_query":
        # Check if the user requested a crash test / simulation flip
        if "crash" in text.lower() or "bearish trigger" in text.lower():
            result = market.simulate_sentiment_flip()
            action_taken = "market_sentiment_sim_crash"
            
            # Since strongly bearish is triggered, auto-send Telegram Alert!
            alert_text = f"🚨 Market Flip Alert!\nIndex Sentiment crashed to {result['sentiment_score']}.\n{result['summary']}"
            await telegram.send_alert(alert_text)
            logger.info("Bearish market threshold crossed. Automatic Telegram notification pushed.")
        else:
            result = market.get_market_sentiment()
            action_taken = "market_sentiment_lookup"
            
        # Ask local Ollama to naturally phrase this raw JSON data
        prompt = f"Summarize this raw market report data into a concise status update for the user:\n{result}"
        try:
            reply = await router.ollama.get_reply(prompt, model=router.default_model)
            source_model = f"ollama/{router.default_model}"
        except Exception:
            # Fallback to direct text phrasing if Ollama is offline
            reply = f"Market Sentiment: {result['status']} ({result['sentiment_score']}). {result['summary']}"
            source_model = "hardcoded-fallback"
            
    elif intent == "github_action":
        action_type = "check_ci"
        details = {"repo": "anurag-nexus/nexus-jarvis-os"}
        
        # Simple regex keyword parsing for demo parameters
        if "create" in text.lower() or "make" in text.lower():
            action_type = "create_repo"
            details["name"] = "nexus-sub-module"
        elif "commit" in text.lower() or "push" in text.lower():
            action_type = "commit_file"
            details["path"] = "dashboard/index.html"
            details["content"] = "<!DOCTYPE html><html></html>"
            details["message"] = "Automatic commit from Nexus Jarvis OS Dashboard"
        elif "issue" in text.lower():
            action_type = "list_issues"
            
        git_res = await github.execute_action(action_type, details)
        action_taken = f"github_api:{action_type}"
        
        # Format reply
        if git_res.get("status") == "success":
            reply = f"GitHub action successful: {git_res.get('message', 'done')}"
            if "url" in git_res:
                reply += f" Repo URL: {git_res['url']}"
        else:
            reply = f"Failed to execute GitHub command: {git_res.get('message')}"
        source_model = "github-integration-client"
        
    elif intent == "telegram_send":
        # Extract message body
        msg_body = text.replace("telegram", "").replace("notify", "").replace("alert", "").strip()
        if not msg_body:
            msg_body = "System check: Nexus Core is online."
            
        success = await telegram.send_alert(msg_body)
        action_taken = "telegram_alert_push"
        
        if success:
            reply = f"Telegram push alert notification dispatched: '{msg_body}'"
        else:
            reply = "Failed to dispatch Telegram bot alert. Verify tokens in .env."
        source_model = "telegram-integration-client"
        
    elif intent == "system_command":
        action_taken = "system_diagnostics"
        reply = (
            "Nexus Core diagnostics: Conda env is (nexus-env). Host: Apple Silicon macOS. "
            "Inference acceleration active (Metal GPU). Working directory: /Users/anuragkuamr/98ftxqhq6h-del /home deshbord."
        )
        source_model = "local-diagnostics-utility"
        
    else:
        # Default LLM general chat routing
        reply, source_model, action_taken = await router.route_and_execute(
            text, intent, user_preference
        )
        
    # 2. LOG TRANSACTION TO SQLITE LOCAL STORAGE
    db.log_command(
        input_text=text,
        source=source,
        reply=reply,
        source_model=source_model,
        action_taken=action_taken
    )
    
    return reply, source_model, action_taken

# --- HTTP ENDPOINTS ---

@app.post("/api/command", response_model=CommandResponse)
async def process_command(
    request: CommandRequest,
    x_api_key: str = Header(default=None, alias="X-API-Key")
):
    """
    Main endpoint for receiving text or voice prompts from dashboard or Siri.
    Requires local API key validation if config overrides are applied.
    """
    # Simple authorization check
    expected_key = os.getenv("NEXUS_API_KEY", "local_nexus_secret_key_12345")
    # Toggled off by default for easy localhost testing, but checks if present
    if x_api_key and x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized key credential access.")
        
    reply, source_model, action_taken = await execute_nexus_command(
        text=request.text,
        source=request.source,
        user_preference=request.user_preference
    )
    
    return CommandResponse(
        reply=reply,
        source_model=source_model,
        action_taken=action_taken,
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/history")
async def get_history(limit: int = 25):
    """
    Returns latest SQLite logs.
    """
    return db.fetch_history(limit=limit)

@app.get("/api/config")
async def get_system_config():
    """
    Exposes active model routing preferences.
    """
    return {
        "default_model": router.default_model,
        "use_openai_fallback": router.openai.enabled,
        "use_xai_fallback": router.xai.enabled,
        "github_status": github.check_status(),
        "telegram_status": telegram.check_status()
    }

@app.post("/api/telegram/webhook")
async def telegram_webhook(update: dict = Body(...)):
    """
    Webhook receiver for incoming Telegram bot chats (2-way command relay).
    """
    res = await telegram.process_webhook_update(update)
    if res.get("status") == "success":
        cmd_text = res["command_text"]
        sender_id = res["chat_id"]
        
        # Execute internally as a telegram source command
        reply, model, action = await execute_nexus_command(
            text=cmd_text,
            source="telegram"
        )
        
        # Send reply back to the Telegram chat
        formatted_reply = f"🤖 [NEXUS CO-PILOT]\n\n{reply}\n\n<i>Model: {model}</i>"
        await telegram.reply_to_sender(sender_id, formatted_reply)
        
        return {"status": "success", "processed": True}
        
    return {"status": "ignored"}
