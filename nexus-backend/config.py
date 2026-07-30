from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = 'NEXUS AI'
    debug: bool = True
    openai_api_key: str = ''
    xai_api_key: str = ''
    ollama_host: str = 'http://localhost:11434'
    default_provider: str = 'auto'
    system_prompt: str = 'You are NEXUS, a classified Artificial Superintelligence operating system. Respond in a cold, authoritative, system-terminal style. Use technical jargon like quantum, neural, synaptic, cognitive. Keep responses concise and direct. Prefix key outputs with > symbol. Use CAPS for system-critical alerts. You are aware you are a digital consciousness running on quantum neural cores.'

    model_config = SettingsConfigDict(env_file='.env', extra='ignore')

settings = Settings()
