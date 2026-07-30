import random
import logging

logger = logging.getLogger("nexus-core")

class MarketPulse:
    def __init__(self):
        # Watchlist metrics
        self.watchlist = {
            "AAPL": {"price": 189.42, "change": 1.24},
            "NVDA": {"price": 875.12, "change": 3.82},
            "TSLA": {"price": 171.05, "change": -0.87},
            "BTC-USD": {"price": 67240.0, "change": 0.95},
            "NIFTY50": {"price": 24315.80, "change": 0.45}
        }

    def get_market_sentiment(self) -> dict:
        """
        Calculates simulated market index sentiment.
        """
        sentiment_pct = random.randint(65, 82) # Simulated index
        # Let's say we have an option to fluctuate strongly bearish for testing
        is_bearish = sentiment_pct < 50
        
        status = "BULLISH" if sentiment_pct >= 50 else "BEARISH"
        
        return {
            "sentiment_score": f"{sentiment_pct}%",
            "status": status,
            "volatility": "MODERATE",
            "summary": f"Nifty indices displaying consolidation at critical support levels.Watchlist tickers trending upwards with a general {status.lower()} sentiment.",
            "watchlist": self.watchlist
        }

    def simulate_sentiment_flip(self) -> dict:
        """
        Simulates a bearish market crash event to test auto-trigger Telegram alerts.
        """
        sentiment_pct = random.randint(28, 42)
        return {
            "sentiment_score": f"{sentiment_pct}%",
            "status": "STRONGLY BEARISH",
            "volatility": "HIGH",
            "summary": "Sudden sell-off triggers volatility circuit breakers. Nifty support cracked. Immediate risk mitigation recommended.",
            "watchlist": {
                "AAPL": {"price": 181.10, "change": -3.42},
                "NVDA": {"price": 815.00, "change": -6.85},
                "TSLA": {"price": 158.00, "change": -7.10},
                "BTC-USD": {"price": 61200.0, "change": -8.50},
                "NIFTY50": {"price": 23410.15, "change": -3.80}
            }
        }

    def get_ticker_details(self, symbol: str) -> dict:
        symbol_upper = symbol.upper()
        if symbol_upper in self.watchlist:
            details = self.watchlist[symbol_upper]
            return {
                "symbol": symbol_upper,
                "price": f"${details['price']}" if "BTC" in symbol_upper or "AAPL" in symbol_upper or "TSLA" in symbol_upper or "NVDA" in symbol_upper else f"₹{details['price']}",
                "change": f"{details['change']}%",
                "status": "UP" if details["change"] >= 0 else "DOWN"
            }
        return {"error": f"Symbol {symbol} not found in active watchlist."}
