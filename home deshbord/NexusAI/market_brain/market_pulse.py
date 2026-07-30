import random

class MarketBrain:
    def __init__(self):
        self.tickers = {
            "AAPL": {"price": 189.42, "change": 1.24, "indicator": "RSI: 58 (Neutral)"},
            "NVDA": {"price": 875.12, "change": 3.82, "indicator": "RSI: 72 (Overbought)"},
            "TSLA": {"price": 171.05, "change": -0.87, "indicator": "RSI: 41 (Oversold)"},
            "BTC-USD": {"price": 67240.0, "change": 0.95, "indicator": "MACD Bullish Cross"},
            "NIFTY50": {"price": 24315.80, "change": 0.45, "indicator": "EMA200 Support"}
        }

    def get_market_analysis(self) -> dict:
        sentiment = random.randint(62, 85)
        return {
            "sentiment_index": f"{sentiment}%",
            "condition": "BULLISH" if sentiment >= 50 else "BEARISH",
            "volume_trend": "GROWING",
            "headlines": [
                "Tech indices rise on back of AI semiconductor hardware demand.",
                "Ollama updates local model loading latency for Apple Silicon devices.",
                "Macro indicators signal stable global rate cycles."
            ],
            "watchlist": self.tickers
        }

    def trigger_bearish_event(self) -> dict:
        sentiment = random.randint(25, 42)
        crashed_tickers = {
            "AAPL": {"price": 181.10, "change": -3.42, "indicator": "RSI: 32 (Oversold)"},
            "NVDA": {"price": 815.00, "change": -6.85, "indicator": "RSI: 48 (Neutral)"},
            "TSLA": {"price": 158.00, "change": -7.10, "indicator": "RSI: 26 (Oversold)"},
            "BTC-USD": {"price": 61200.0, "change": -8.50, "indicator": "MACD Bearish Cross"},
            "NIFTY50": {"price": 23410.15, "change": -3.80, "indicator": "EMA200 Breached"}
        }
        return {
            "sentiment_index": f"{sentiment}%",
            "condition": "STRONGLY BEARISH",
            "volume_trend": "PANIC_SELL",
            "headlines": [
                "Tech sector undergoes sharp correction.",
                "Volatility spikes as global support ranges crack."
            ],
            "watchlist": crashed_tickers
        }
