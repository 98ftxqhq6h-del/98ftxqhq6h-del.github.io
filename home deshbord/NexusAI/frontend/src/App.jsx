import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Chat States
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Nexus AI Command Center initialized. Active model: qwen2.5-coder.', provider: 'ollama', model: 'qwen2.5-coder' }
  ]);
  const [inputText, setInputText] = useState('');
  const [provider, setProvider] = useState('ollama');
  const [isChatThinking, setIsChatThinking] = useState(false);

  // System Telemetry & Log States
  const [cpuUsage, setCpuUsage] = useState(22);
  const [ramUsage, setRamUsage] = useState(9.0);
  const [ollamaState, setOllamaState] = useState('online');
  const [terminalLogs, setTerminalLogs] = useState([
    { command: 'conda activate nexus-env', status: 'success', output: 'Environment loaded successfully.' },
    { command: 'python --version', status: 'success', output: 'Python 3.11.4' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // Settings & Configuration States
  const [settings, setSettings] = useState({
    default_model: 'qwen2.5-coder',
    use_openai: false,
    use_xai: false,
    github_status: 'SIMULATION',
    telegram_status: 'SIMULATION'
  });

  // Market & Telegram logs
  const [marketData, setMarketData] = useState(null);
  const [telegramMsg, setTelegramMsg] = useState('');
  const [telegramLogs, setTelegramLogs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [simulatedVoiceInput, setSimulatedVoiceInput] = useState('');

  // DOM references
  const chatEndRef = useRef(null);

  // Load Initial Configurations & Telemetry Loop
  useEffect(() => {
    fetchSettings();
    fetchMarketData(false);
    fetchLogs();

    // Fluctuating Telemetry Simulation (Jarvis style metrics)
    const telemetryInterval = setInterval(() => {
      setCpuUsage(prev => {
        const delta = Math.floor(Math.random() * 9) - 4;
        const next = prev + delta;
        return Math.max(10, Math.min(65, next));
      });
      setRamUsage(prev => {
        const delta = (Math.random() * 0.4) - 0.2;
        const next = prev + delta;
        return parseFloat(Math.max(8.5, Math.min(10.5, next)).toFixed(1));
      });
    }, 2000);

    return () => clearInterval(telemetryInterval);
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // --- API CALLS ---
  const fetchSettings = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/settings');
      if (resp.ok) {
        const data = await resp.json();
        setSettings(data);
      }
    } catch (err) {
      console.warn("FastAPI backend connection offline. Operating in standalone demo mode.");
    }
  };

  const fetchMarketData = async (crashed = false) => {
    try {
      const resp = await fetch(`http://127.0.0.1:8000/market?crashed=${crashed}`);
      if (resp.ok) {
        const data = await resp.json();
        setMarketData(data);
      }
    } catch (err) {
      // Mock Local Fallback
      setMarketData({
        sentiment_index: crashed ? "34%" : "72%",
        condition: crashed ? "STRONGLY BEARISH" : "BULLISH",
        volume_trend: crashed ? "PANIC_SELL" : "GROWING",
        headlines: crashed 
          ? ["Tech indices crash on corrective sell-offs."]
          : ["System nodes active. AI stocks rally on hardware releases."],
        watchlist: {
          "AAPL": { price: 189.42, change: crashed ? -3.42 : 1.24, indicator: "RSI: Neutral" },
          "NVDA": { price: 875.12, change: crashed ? -6.85 : 3.82, indicator: "RSI: Overbought" },
          "NIFTY50": { price: 24315.80, change: crashed ? -3.80 : 0.45, indicator: "EMA200 Support" }
        }
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const resp = await fetch('http://127.0.0.1:8000/memory');
      if (resp.ok) {
        const data = await resp.json();
        if (data.chat_history && data.chat_history.length > 0) {
          const formatted = data.chat_history.reverse().map(c => ({
            role: 'user', content: c.input_text, reply: c.reply, provider: c.provider, model: c.model
          }));
          const list = [];
          formatted.forEach(item => {
            list.push({ role: 'user', content: item.content });
            list.push({ role: 'assistant', content: item.reply, provider: item.provider, model: item.model });
          });
          setMessages(prev => [...prev.slice(0, 1), ...list]);
        }
      }
    } catch (err) {
      console.warn("Unable to fetch SQLite logs.");
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Append user turn
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    if (!textToSend) setInputText('');
    setIsChatThinking(true);

    try {
      const resp = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, provider: provider })
      });

      if (!resp.ok) throw new Error("API Connection Failed");

      const data = await resp.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        provider: data.provider,
        model: data.model
      }]);
    } catch (err) {
      // Mock Fallback Reply
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `[DEMO FALLBACK] Backend offline. Replicating query: "${query}"`,
          provider: 'local-mock',
          model: 'fallback-nlp'
        }]);
      }, 600);
    } finally {
      setIsChatThinking(false);
    }
  };

  const executeTerminalCommand = async () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput;
    setTerminalInput('');

    // Append to CLI logs
    setTerminalLogs(prev => [...prev, { command: cmd, status: 'pending', output: 'Running...' }]);

    try {
      const resp = await fetch('http://127.0.0.1:8000/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await resp.json();

      setTerminalLogs(prev => {
        const list = [...prev];
        list[list.length - 1] = {
          command: cmd,
          status: data.status,
          output: data.output || data.message
        };
        return list;
      });
    } catch (err) {
      setTerminalLogs(prev => {
        const list = [...prev];
        list[list.length - 1] = {
          command: cmd,
          status: 'failed',
          output: '[DEMO] Connection timed out. Executable commands require active FastAPI backend.'
        };
        return list;
      });
    }
  };

  const handleVoiceUpload = async () => {
    setIsListening(true);
    // Simulate audio recording timer
    setTimeout(async () => {
      setIsListening(false);
      const text = simulatedVoiceInput || "Hey Nexus, check Nifty sentiment";
      setSimulatedVoiceInput('');
      
      setMessages(prev => [...prev, { role: 'user', content: `🎙️ "${text}" (Voice Input)` }]);
      setIsChatThinking(true);

      try {
        const resp = await fetch('http://127.0.0.1:8000/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ 'simulated_voice_text': text })
        });
        const data = await resp.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.reply,
          provider: 'ollama',
          model: data.model
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "[VOICE DEMO] Heard: " + text + ". Core API offline.",
          provider: 'voice-stt',
          model: 'whisper-tiny-sim'
        }]);
      } finally {
        setIsChatThinking(false);
      }
    }, 1500);
  };

  const handleSettingsToggle = async (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
    try {
      await fetch('http://127.0.0.1:8000/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: val ? "true" : "false" })
      });
    } catch (err) {
      console.warn("Unable to save setting variables.");
    }
  };

  const sendTelegramAlert = async () => {
    if (!telegramMsg.trim()) return;
    const msg = telegramMsg;
    setTelegramMsg('');
    setTelegramLogs(prev => [...prev, `Sending: "${msg}"...`]);

    try {
      const resp = await fetch('http://127.0.0.1:8000/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await resp.json();
      if (data.status === 'success') {
        setTelegramLogs(prev => [...prev.slice(0, -1), `✓ Pushed notification: "${msg}"`]);
      } else {
        setTelegramLogs(prev => [...prev.slice(0, -1), `✗ Failed to push notification.`]);
      }
    } catch (err) {
      setTelegramLogs(prev => [...prev.slice(0, -1), `[DEMO] Webhook offline. Simulated message: "${msg}"`]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-bg-dark text-slate-200 overflow-hidden font-display cyber-grid">
      
      {/* ==================== SIDEBAR NAVIGATION ==================== */}
      <aside className="w-64 border-r border-border-glass bg-bg-dark/80 backdrop-blur-md flex flex-col z-20">
        {/* App Logo branding */}
        <div className="p-6 border-b border-border-glass flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg border border-neon-cyan flex items-center justify-center animate-glow-cyan">
            <span className="text-neon-cyan font-bold text-lg">N</span>
          </div>
          <div>
            <h1 className="font-bold tracking-wider text-sm text-slate-100">NEXUS AI OS</h1>
            <p className="text-[10px] text-neon-cyan tracking-widest uppercase">Jarvis Console</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { id: 'chat', label: 'AI Copilot Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { id: 'terminal', label: 'Console Command', icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { id: 'market', label: 'Market Brain', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
            { id: 'telegram', label: 'Telegram Bot', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
            { id: 'settings', label: 'Console Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all ${
                activeTab === item.id 
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20' 
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Top-Bar Status flags */}
        <div className="p-4 border-t border-border-glass bg-slate-950/20 text-[10px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">OLLAMA ENGINE</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              <span>ONLINE</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">GITHUB AGENT</span>
            <span className="text-neon-cyan">{settings.github_status}</span>
          </div>
        </div>
      </aside>

      {/* ==================== CENTRAL VIEW CONTAINER ==================== */}
      <main className="flex-1 flex flex-col h-full bg-bg-dark/40 overflow-hidden z-10 relative">
        
        {/* Title / Utility Topbar */}
        <header className="h-16 border-b border-border-glass px-8 flex items-center justify-between bg-bg-dark/70 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="text-neon-cyan uppercase font-semibold text-xs tracking-widest">{activeTab}</span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] text-slate-500 font-mono">NODE_OS_M5_MBA</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded border border-border-glass flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
              <span>Active Model: {settings.default_model}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Screen Panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          
          {/* ==================== VIEW: DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Telemetry quick status blocks */}
              <div className="grid grid-cols-3 gap-6">
                <div className="glassmorphism p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">CPU Telemetry</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{cpuUsage}%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                </div>

                <div className="glassmorphism p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">RAM Core Alloc</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{ramUsage} GB</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-neon-pink" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>

                <div className="glassmorphism p-6 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">System Health</span>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">92%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Layout grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Visual financial pulse widget */}
                <div className="glassmorphism p-6 rounded-xl space-y-4">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-neon-cyan">Market Pulse Monitor</h4>
                  {marketData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">INDEX SENTIMENT</span>
                        <span className={`text-xs px-2.5 py-1 rounded font-semibold font-mono ${marketData.condition === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {marketData.condition} ({marketData.sentiment_index})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(marketData.watchlist).map(([t, val]) => (
                          <div key={t} className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-2">
                            <span className="font-mono text-slate-300 font-medium">{t}</span>
                            <div className="space-x-3 font-mono text-right">
                              <span>${val.price.toLocaleString()}</span>
                              <span className={val.change >= 0 ? 'text-emerald-400' : 'text-rose-500'}>
                                {val.change >= 0 ? '+' : ''}{val.change}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Querying market indices...</p>
                  )}
                </div>

                {/* Console activity stream */}
                <div className="glassmorphism p-6 rounded-xl flex flex-col h-64">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-neon-cyan mb-4">Command Terminal Activity</h4>
                  <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px]">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="border-b border-slate-800/40 pb-2">
                        <div className="text-slate-400 flex justify-between">
                          <span>$ {log.command}</span>
                          <span className={log.status === 'success' ? 'text-emerald-400' : 'text-rose-500'}>[{log.status.toUpperCase()}]</span>
                        </div>
                        <div className="text-slate-500 mt-0.5 truncate">{log.output}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW: AI CHAT ==================== */}
          {activeTab === 'chat' && (
            <div className="glassmorphism rounded-xl flex flex-col h-[calc(100vh-12rem)]">
              {/* Chat model controls */}
              <div className="p-4 border-b border-border-glass bg-slate-950/20 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-400">PROVIDER</span>
                  <div className="flex bg-slate-900 p-1 rounded-lg border border-border-glass">
                    {['ollama', 'openai', 'xai'].map(prov => (
                      <button
                        key={prov}
                        onClick={() => setProvider(prov)}
                        className={`text-[10px] font-mono px-3 py-1 rounded transition-all uppercase ${
                          provider === prov ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {prov}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Voice integration quick toggles */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={simulatedVoiceInput}
                    onChange={(e) => setSimulatedVoiceInput(e.target.value)}
                    placeholder="Simulate mic transcription..."
                    className="bg-slate-900 border border-border-glass text-[10px] px-3 py-1.5 rounded focus:outline-none focus:border-neon-cyan w-48 font-mono text-slate-300"
                  />
                  <button 
                    onClick={handleVoiceUpload}
                    className={`p-2 rounded-lg border flex items-center space-x-2 text-xs transition-all ${
                      isListening 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse' 
                        : 'bg-slate-900 border-border-glass text-slate-300 hover:border-neon-cyan'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>{isListening ? 'Listening...' : 'Hey Nexus'}</span>
                  </button>
                </div>
              </div>

              {/* Chat logging view */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-xl text-sm ${
                      m.role === 'user'
                        ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/25 rounded-tr-none'
                        : 'bg-slate-900/80 border border-border-glass text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      {m.role === 'assistant' && m.model && (
                        <div className="text-[9px] font-mono text-slate-500 mt-2 flex justify-between">
                          <span>PROVIDER: {m.provider.toUpperCase()}</span>
                          <span>MODEL: {m.model}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900/80 border border-border-glass p-4 rounded-xl rounded-tl-none text-xs text-neon-cyan flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Send prompt row */}
              <div className="p-4 border-t border-border-glass bg-slate-950/20">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex space-x-3"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter command prompt (e.g. check nifty, create repo, run python)..."
                    className="flex-1 bg-slate-950/80 border border-border-glass rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan text-slate-100 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-6 bg-neon-cyan text-bg-dark font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition-all shadow-md shadow-neon-cyan/10"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ==================== VIEW: TERMINAL ==================== */}
          {activeTab === 'terminal' && (
            <div className="glassmorphism rounded-xl flex flex-col h-[calc(100vh-12rem)] font-mono">
              <div className="p-4 border-b border-border-glass bg-slate-950/20 text-xs text-slate-400">
                Nexus CLI Command Execution Panel
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <span className="text-neon-cyan">$</span>
                      <span>{log.command}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        log.status === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : log.status === 'blocked' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                    {log.output && (
                      <pre className="bg-slate-950/60 p-3 rounded border border-slate-900 text-slate-400 overflow-x-auto whitespace-pre-wrap">
                        {log.output}
                      </pre>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border-glass bg-slate-950/20 flex space-x-3">
                <span className="text-neon-cyan flex items-center font-bold font-mono">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') executeTerminalCommand(); }}
                  placeholder="Execute safe system shell command (e.g. ls, pwd, git status)..."
                  className="flex-1 bg-slate-950/80 border border-border-glass rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-neon-cyan text-slate-200"
                />
              </div>
            </div>
          )}

          {/* ==================== VIEW: MARKET ==================== */}
          {activeTab === 'market' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-100">Market Brain Telemetry</h2>
                <div className="space-x-3">
                  <button
                    onClick={() => fetchMarketData(false)}
                    className="px-4 py-2 bg-slate-900 border border-border-glass text-xs rounded hover:border-neon-cyan"
                  >
                    Sync Watchlist
                  </button>
                  <button
                    onClick={() => fetchMarketData(true)}
                    className="px-4 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs rounded hover:bg-rose-500/30"
                  >
                    Simulate Bearish Crash Event
                  </button>
                </div>
              </div>

              {marketData && (
                <div className="grid grid-cols-3 gap-6">
                  {Object.entries(marketData.watchlist).map(([t, val]) => (
                    <div key={t} className="glassmorphism p-6 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-sm text-slate-300 font-bold">{t}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${val.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {val.change >= 0 ? '↑' : '↓'} {Math.abs(val.change)}%
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-mono">${val.price.toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-500 font-mono">{val.indicator}</p>
                    </div>
                  ))}
                </div>
              )}

              {marketData && (
                <div className="glassmorphism p-6 rounded-xl space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">Market Intelligence Headlines</h4>
                  <ul className="space-y-2.5">
                    {marketData.headlines.map((hl, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-neon-cyan mt-1">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ==================== VIEW: TELEGRAM ==================== */}
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-slate-100">Telegram Bot Notifications Relay</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="glassmorphism p-6 rounded-xl space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">Push System Alerts</h4>
                  <div className="space-y-3">
                    <textarea
                      value={telegramMsg}
                      onChange={(e) => setTelegramMsg(e.target.value)}
                      placeholder="Enter alert notification text to push to your Telegram channel..."
                      className="w-full h-32 bg-slate-950/80 border border-border-glass rounded-lg p-4 text-xs focus:outline-none focus:border-neon-cyan text-slate-100"
                    />
                    <button
                      onClick={sendTelegramAlert}
                      className="px-6 py-2.5 bg-neon-cyan text-bg-dark font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-cyan-400"
                    >
                      Dispatch Alert
                    </button>
                  </div>
                </div>

                <div className="glassmorphism p-6 rounded-xl flex flex-col h-[300px]">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan mb-4">Relay System Logs</h4>
                  <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[11px] text-slate-400">
                    {telegramLogs.map((log, i) => (
                      <div key={i} className="border-b border-slate-800/40 pb-1.5">
                        {log}
                      </div>
                    ))}
                    {telegramLogs.length === 0 && (
                      <span className="text-slate-500 text-xs italic">No messages sent in this session yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW: SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <div className="glassmorphism p-8 rounded-xl max-w-2xl space-y-6">
              <h2 className="text-lg font-bold text-neon-cyan border-b border-border-glass pb-4 uppercase tracking-wider">Console Config Manager</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">OpenAI Fallback Escalation</h4>
                    <p className="text-[10px] text-slate-500">Route complex code logic to gpt-4o-mini if local Ollama fails.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.use_openai}
                    onChange={(e) => handleSettingsToggle('use_openai', e.target.checked)}
                    className="w-4 h-4 text-neon-cyan bg-slate-900 border-slate-700 rounded focus:ring-neon-cyan"
                  />
                </div>

                <div className="flex justify-between items-center py-2 border-t border-slate-800/60">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">xAI Grok Context Integration</h4>
                    <p className="text-[10px] text-slate-500">Enable paid real-time search lookup indexes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.use_xai}
                    onChange={(e) => handleSettingsToggle('use_xai', e.target.checked)}
                    className="w-4 h-4 text-neon-cyan bg-slate-900 border-slate-700 rounded focus:ring-neon-cyan"
                  />
                </div>

                <div className="py-2 border-t border-slate-800/60 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-200">Default Weights Model</h4>
                  <select
                    value={settings.default_model}
                    onChange={(e) => handleSettingsToggle('default_model', e.target.value)}
                    className="bg-slate-950 border border-border-glass text-xs rounded px-3 py-1.5 text-slate-300 font-mono focus:outline-none"
                  >
                    <option value="qwen2.5-coder">qwen2.5-coder (active)</option>
                    <option value="llama3.2">llama3.2</option>
                    <option value="deepseek-r1:14b">deepseek-r1:14b</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ==================== RIGHT SIDEBAR SYSTEM HUD ==================== */}
      <aside className="w-80 border-l border-border-glass bg-bg-dark/80 backdrop-blur-md p-6 space-y-8 flex flex-col items-center z-20">
        
        {/* Core animated logo indicator */}
        <div className="text-center space-y-3">
          <span className="text-[10px] text-slate-500 tracking-widest uppercase">Nexus AI Core State</span>
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Spinning background circles */}
            <div className="absolute inset-0 rounded-full border border-dashed border-neon-cyan/20 animate-spin-slow"></div>
            <div className="absolute inset-2 rounded-full border border-dotted border-neon-pink/15 animate-spin [animation-duration:12s] reverse"></div>
            
            {/* Core pulsing orb */}
            <div className="w-24 h-24 rounded-full bg-slate-950 border-2 border-neon-cyan/40 shadow-inner flex items-center justify-center relative">
              <div className="w-16 h-16 rounded-full bg-neon-cyan/5 border border-neon-cyan/30 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-neon-cyan/30 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry charts */}
        <div className="w-full space-y-4">
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-border-glass pb-2">Hardware Telemetry</h4>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">CPU Load</span>
              <span className="text-neon-cyan">{cpuUsage}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded overflow-hidden border border-slate-800">
              <div 
                className="bg-neon-cyan h-full transition-all duration-500" 
                style={{ width: `${cpuUsage}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">RAM Load</span>
              <span className="text-neon-pink">{ramUsage} GB / 16.0 GB</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded overflow-hidden border border-slate-800">
              <div 
                className="bg-neon-pink h-full transition-all duration-500" 
                style={{ width: `${(ramUsage / 16.0) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">SYS Health</span>
              <span className="text-emerald-400">92%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded overflow-hidden border border-slate-800">
              <div 
                className="bg-emerald-400 h-full" 
                style={{ width: '92%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* System Details Box */}
        <div className="w-full glassmorphism p-4 rounded-xl text-[10px] font-mono space-y-2">
          <div className="text-neon-cyan border-b border-border-glass pb-1.5 mb-1.5 uppercase font-bold">Diagnostics Log</div>
          <div className="text-slate-400">OS: macOS Darwin x64</div>
          <div className="text-slate-400">Env: (nexus-env) miniconda</div>
          <div className="text-slate-400">Engine: metal_shader_acceleration</div>
          <div className="text-slate-400">Listen Node: port 8000 (FASTAPI)</div>
        </div>

      </aside>
      
    </div>
  );
}
