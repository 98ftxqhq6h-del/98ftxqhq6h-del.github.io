/* ==========================================================================
   NEXUS JARVIS OS — CORE INTERACTION ENGINE
   Language: Vanilla ES6 Javascript
   Designer/Owner ID: Anurag — NexusAI & CHRONOVERSE X16 ecosystem
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- INITIALIZE UI STATE ---
    initClock();
    initSidebar();
    initBackgroundParticles();
    initMouseParallax();
    initDiagnosticsCharts();
    initSentimentAndSparklines();
    initCommandBar();
    initAICoreVisualizer();
    initQuickLaunchers();
});

/* ==========================================================================
   1. SYSTEM CLOCK & DATE
   ========================================================================== */
function initClock() {
    const clockTime = document.getElementById('clock-time');
    const clockDate = document.getElementById('clock-date');
    
    function updateClock() {
        const now = new Date();
        
        // Time HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockTime.textContent = `${hours}:${minutes}:${seconds}`;
        
        // Date: DAY, MMM DD, YYYY
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        clockDate.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. COLLAPSIBLE LEFT SIDEBAR
   ========================================================================== */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    // Sidebar collapse action
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    // Section navigation click handlers
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const sectionName = item.getAttribute('data-section');
            logToTerminal(`System navigation: loaded view [${sectionName.toUpperCase()}]`);
            
            // Interaction: speech feedback depending on view clicked
            if (sectionName === 'market') {
                speakCopilot("Accessing NexusAI market analysis feed... Analyzing volatility levels and stock ticker streams.");
            } else if (sectionName === 'chat') {
                speakCopilot("Establishing secure link to Chronoverse AI companion. Synchronizing synaptic relays.");
            } else if (sectionName === 'chrono') {
                speakCopilot("Navigating to Chronoverse sub-system. Launching hexadecimal clock modules.");
            } else if (sectionName === 'news') {
                speakCopilot("Retrieving headlines from NexusAI real-time RSS aggregator feed.");
            } else if (sectionName === 'home') {
                speakCopilot("Displaying central home dashboard. All systems report green status.");
            }
        });
    });
}

/* ==========================================================================
   3. BACKGROUND CONSTELLATION PARTICLES
   ========================================================================== */
function initBackgroundParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const particles = [];
    const maxParticles = 65;
    const connectionDist = 120;
    
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
            this.hue = 178; // Neon cyan HSL
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Edge bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, 0.35)`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#00fff7';
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
        }
    }
    
    // Spawn particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw links first
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < connectionDist) {
                    const alpha = (1 - dist / connectionDist) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 255, 247, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        
        // Update & draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

/* ==========================================================================
   4. MOUSE PARALLAX EFFECT
   ========================================================================== */
function initMouseParallax() {
    const bgParallax = document.getElementById('bg-parallax');
    if (!bgParallax) return;
    
    window.addEventListener('mousemove', (e) => {
        // Calculate offsets relative to viewport center
        const xOffset = (e.clientX / window.innerWidth - 0.5) * -20; // max shift 20px
        const yOffset = (e.clientY / window.innerHeight - 0.5) * -20;
        
        bgParallax.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
}

/* ==========================================================================
   5. SYSTEM DIAGNOSTICS CANVASES (CPU & RAM charts)
   ========================================================================== */
function initDiagnosticsCharts() {
    const cpuCanvas = document.getElementById('cpu-chart');
    const ramCanvas = document.getElementById('ram-chart');
    const cpuText = document.getElementById('cpu-value');
    const ramText = document.getElementById('ram-value');
    
    if (!cpuCanvas || !ramCanvas) return;
    
    const cpuCtx = cpuCanvas.getContext('2d');
    const ramCtx = ramCanvas.getContext('2d');
    
    // Keep 25 history data points
    const historyLength = 25;
    const cpuHistory = Array(historyLength).fill(20);
    const ramHistory = Array(historyLength).fill(55);
    
    function drawMiniChart(ctx, canvas, history, isRam = false) {
        const w = canvas.width = canvas.clientWidth;
        const h = canvas.height = canvas.clientHeight;
        
        ctx.clearRect(0, 0, w, h);
        
        // Create gradients
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        if (isRam) {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)'); // blue
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
        } else {
            gradient.addColorStop(0, 'rgba(0, 255, 247, 0.4)'); // cyan
            gradient.addColorStop(1, 'rgba(0, 255, 247, 0.0)');
        }
        
        ctx.beginPath();
        const step = w / (historyLength - 1);
        
        // Move to first coordinate
        let y0 = h - (history[0] / 100) * (h - 6) - 3;
        ctx.moveTo(0, y0);
        
        for (let i = 1; i < history.length; i++) {
            const x = i * step;
            const y = h - (history[i] / 100) * (h - 6) - 3;
            ctx.lineTo(x, y);
        }
        
        // Stroke
        ctx.strokeStyle = isRam ? '#3b82f6' : '#00fff7';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        
        // Fill area
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }
    
    // Cycle updates with slight fluctuations
    setInterval(() => {
        // CPU load flutters (simulating Ollama/Python activity, centered around 22%)
        let lastCpu = cpuHistory[cpuHistory.length - 1];
        let diff = (Math.random() - 0.5) * 6; // small drift
        let nextCpu = Math.max(12, Math.min(36, Math.round(lastCpu + diff)));
        cpuHistory.push(nextCpu);
        cpuHistory.shift();
        cpuText.textContent = `${nextCpu}%`;
        
        // Update top-bar battery health text occasionally (centered around 92%)
        const sysHealthVal = document.querySelector('#status-health .status-text');
        if (sysHealthVal) {
            let battery = Math.max(90, Math.min(94, Math.round(92 + (Math.random() - 0.5) * 0.8)));
            sysHealthVal.textContent = `SYS: ${battery}%`;
        }
        
        // RAM load stays stable in GB (centered around 9.0 GB, representing ~56% of 16GB)
        let lastRam = ramHistory[ramHistory.length - 1];
        let ramDiff = (Math.random() - 0.5) * 1.5;
        let nextRam = Math.max(53, Math.min(59, Math.round(lastRam + ramDiff)));
        ramHistory.push(nextRam);
        ramHistory.shift();
        
        // Compute GB value based on percentage
        let ramGb = ((nextRam / 100) * 16).toFixed(1);
        ramText.textContent = `${ramGb} GB`;
        
        drawMiniChart(cpuCtx, cpuCanvas, cpuHistory, false);
        drawMiniChart(ramCtx, ramCanvas, ramHistory, true);
    }, 1000);
    
    // Initial draw
    drawMiniChart(cpuCtx, cpuCanvas, cpuHistory, false);
    drawMiniChart(ramCtx, ramCanvas, ramHistory, true);
}

/* ==========================================================================
   6. YFINANCE STOCK TICKERS, SPARKLINES & SENTIMENT GAUGE
   ========================================================================== */
function initSentimentAndSparklines() {
    // --- ANIMATE SENTIMENT GAUGE ---
    const sentimentNeedle = document.getElementById('sentiment-needle');
    const sentimentVal = document.getElementById('sentiment-val');
    
    let sentimentPercent = 0.70; // 70% Bullish starting
    
    function updateSentiment(percent) {
        // SVG circle gauge has dasharray 126
        const fill = document.getElementById('sentiment-fill');
        const offset = 126 - (percent * 126);
        fill.style.strokeDashoffset = offset;
        
        // Needle rotation is -90deg to +90deg (180deg range)
        const rotation = (percent * 180) - 90;
        sentimentNeedle.style.transform = `rotate(${rotation}deg)`;
        sentimentVal.textContent = `${Math.round(percent * 100)}% ${percent >= 0.5 ? 'Bullish' : 'Bearish'}`;
    }
    
    // Initial draw
    updateSentiment(sentimentPercent);
    
    // Fluctuations
    setInterval(() => {
        let diff = (Math.random() - 0.5) * 0.06;
        sentimentPercent = Math.max(0.45, Math.min(0.88, sentimentPercent + diff));
        updateSentiment(sentimentPercent);
    }, 5000);
    
    // --- DRAW STOCK SPARKLINES ---
    const stocks = [
        { id: 'spark-aapl', history: [186, 185.5, 186.2, 187, 186.8, 187.5, 188.3, 189.42], up: true },
        { id: 'spark-nvda', history: [840, 842, 850, 848, 855, 861, 870, 875.12], up: true },
        { id: 'spark-tsla', history: [178, 177.2, 176, 175.5, 174, 172.3, 171.8, 171.05], up: false },
        { id: 'spark-btc', history: [66100, 66300, 66800, 66500, 66700, 66900, 67100, 67240], up: true }
    ];
    
    function drawSparkline(stock) {
        const canvas = document.getElementById(stock.id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        
        ctx.clearRect(0, 0, w, h);
        
        ctx.beginPath();
        const step = w / (stock.history.length - 1);
        const minVal = Math.min(...stock.history);
        const maxVal = Math.max(...stock.history);
        const valRange = maxVal - minVal || 1;
        
        let y0 = h - ((stock.history[0] - minVal) / valRange) * (h - 4) - 2;
        ctx.moveTo(0, y0);
        
        for (let i = 1; i < stock.history.length; i++) {
            const x = i * step;
            const y = h - ((stock.history[i] - minVal) / valRange) * (h - 4) - 2;
            ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = stock.up ? '#00ff66' : '#ff2975';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    
    // Draw all
    stocks.forEach(drawSparkline);
    
    // Simulate minor ticker flutters
    setInterval(() => {
        stocks.forEach(stock => {
            const lastVal = stock.history[stock.history.length - 1];
            const changePct = (Math.random() - (stock.up ? 0.47 : 0.53)) * 0.015; // slightly bias depending on initial up/down status
            const nextVal = Math.round((lastVal * (1 + changePct)) * 100) / 100;
            
            stock.history.push(nextVal);
            stock.history.shift();
            stock.up = stock.history[stock.history.length - 1] >= stock.history[0];
            
            // Update values in HTML
            const item = document.getElementById(stock.id).closest('.stock-item');
            const priceSpan = item.querySelector('.stock-price');
            const changeSpan = item.querySelector('.stock-change');
            const blockDiv = item.querySelector('.stock-price-block');
            
            // Format currency
            const fmtVal = stock.id.includes('btc') ? `$${nextVal.toLocaleString()}` : `$${nextVal.toFixed(2)}`;
            priceSpan.textContent = fmtVal;
            
            // Calculate change percent
            const startVal = stock.history[0];
            const diffPct = ((nextVal - startVal) / startVal) * 100;
            const sign = diffPct >= 0 ? '+' : '';
            changeSpan.textContent = `${sign}${diffPct.toFixed(2)}%`;
            
            // Change colors
            if (diffPct >= 0) {
                blockDiv.classList.remove('down');
                blockDiv.classList.add('up');
            } else {
                blockDiv.classList.remove('up');
                blockDiv.classList.add('down');
            }
            
            drawSparkline(stock);
        });
    }, 3000);
}

/* ==========================================================================
   7. INTERACTIVE COMMAND LINE BAR & TERMINAL PANEL
   ========================================================================== */
function initCommandBar() {
    const commandInput = document.getElementById('command-input');
    const blinkingCursor = document.querySelector('.blinking-cursor');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalCloseBtn = document.getElementById('terminal-close-btn');
    
    // Align block cursor with typed characters dynamically
    const charWidth = 8.8; // Fixed pixel size approximation for JetBrains Mono at 0.9rem
    
    function positionCursor() {
        const textLen = commandInput.value.length;
        blinkingCursor.style.left = (textLen * charWidth) + 'px';
    }
    
    commandInput.addEventListener('input', positionCursor);
    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitCommand();
        }
    });
    
    sendBtn.addEventListener('click', submitCommand);
    
    // Mic listening click toggle
    micBtn.addEventListener('click', () => {
        toggleMicRecording();
    });
    
    // Terminal overlay close toggle
    terminalCloseBtn.addEventListener('click', () => {
        terminalOverlay.classList.remove('visible');
    });
    
    // Hide overlay when clicking outside the window
    terminalOverlay.addEventListener('click', (e) => {
        if (e.target === terminalOverlay) {
            terminalOverlay.classList.remove('visible');
        }
    });
    
    function submitCommand() {
        const command = commandInput.value.trim();
        if (!command) return;
        
        commandInput.value = '';
        positionCursor();
        
        // Show terminal feedback overlay
        terminalOverlay.classList.add('visible');
        
        // Process command
        executeCommand(command);
    }
}

// Global log tracking for system terminal
function logToTerminal(text, type = 'output') {
    const terminalOutput = document.getElementById('terminal-output');
    if (!terminalOutput) return;
    
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    
    // Get timestamp
    const now = new Date();
    const timestamp = `[${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
    
    line.textContent = `${timestamp} ${text}`;
    terminalOutput.appendChild(line);
    
    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// CLI command interpreter (replaces client-side switch with API fetch)
async function executeCommand(inputStr) {
    logToTerminal(`NEXUS > ${inputStr}`, 'input');
    setCoreState('thinking');
    
    try {
        const response = await fetch("http://127.0.0.1:8080/api/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: inputStr,
                source: "text"
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.action_taken && data.action_taken !== "none") {
            logToTerminal(`[SYSTEM ACTION] ${data.action_taken.toUpperCase()}`, 'system');
        }
        logToTerminal(`[MODEL] ${data.source_model.toUpperCase()}`, 'system');
        logToTerminal(data.reply, 'success');
        
        speakCopilot(data.reply);
        
        // Synchronize model name in UI if it changed via command
        if (inputStr.startsWith('/model') && data.source_model) {
            const modelOnly = data.source_model.split('/').pop();
            const activeModelEl = document.getElementById('active-model-name');
            const ollamaStatusEl = document.querySelector('#status-ollama .status-text');
            if (activeModelEl) activeModelEl.textContent = modelOnly;
            if (ollamaStatusEl) ollamaStatusEl.textContent = `OLLAMA: ${modelOnly.toUpperCase()}`;
        }
        
    } catch (err) {
        console.warn("Backend API connection offline. Falling back to local cockpit shell...", err);
        logToTerminal("[WARNING] Nexus Core backend offline. Running local cockpit simulation.", 'error');
        executeCommandLocal(inputStr);
    }
}

// Local simulation fallback
function executeCommandLocal(inputStr) {
    setTimeout(() => {
        const args = inputStr.split(' ');
        const primary = args[0].toLowerCase();
        
        switch (primary) {
            case '/help':
                logToTerminal('=======================================', 'system');
                logToTerminal('AVAILABLE MODULES & COMMANDS:', 'system');
                logToTerminal('  /help                      Show this diagnostics menu', 'system');
                logToTerminal('  /market                    Run volatility report & update stock prices', 'system');
                logToTerminal('  /news                      Display details from AI news feed headlines', 'system');
                logToTerminal('  /chrono                    Sync and query CHRONOVERSE X16 hex clock details', 'system');
                logToTerminal('  /model [model_name]        Modify local Ollama active model target', 'system');
                logToTerminal('  /system                    Fetch system logs and CPU memory details', 'system');
                logToTerminal('  /voice                     Toggle vocal listening interface', 'system');
                logToTerminal('  /clear                     Wipe local shell console memory lines', 'system');
                logToTerminal('=======================================', 'system');
                speakCopilot("Displaying help diagnostics on the overlay terminal. I can run market analysis, fetch news details, or switch Ollama models.");
                break;
                
            case '/market':
                logToTerminal('>> Fetching yfinance mock feed data...', 'system');
                logToTerminal('>> Sentiment Sentiment Index: 74.32% Bullish', 'success');
                logToTerminal('>> Active Watchlist tickers: AAPL (+1.24%), NVDA (+3.82%), TSLA (-0.87%), BTC-USD (+0.95%)', 'output');
                logToTerminal('>> Sentiment summary: Highly optimistic trend driven by local generative hardware market capital spikes.', 'output');
                speakCopilot("Generating NexusAI volatility log. Sentiment levels are bullish. Tech sectors are leading the indices.");
                break;
                
            case '/news':
                logToTerminal('>> Initializing aggregator parser...', 'system');
                logToTerminal('>> HEADLINE 1: Fed hints at interest rate stability. Sentiment: Neutral.', 'output');
                logToTerminal('>> HEADLINE 2: Ollama pushes v0.5.2 updating local inference speeds. Sentiment: Positive.', 'output');
                logToTerminal('>> HEADLINE 3: Global chip supply chain shifts focus towards automated modular fab facilities. Sentiment: Bullish.', 'output');
                speakCopilot("Retrieving expanded feed highlights. Local execution metrics are positive due to the new Ollama version updates.");
                break;
                
            case '/chrono':
                const hexVal = getHexClockColor();
                logToTerminal('=======================================', 'system');
                logToTerminal('CHRONOVERSE X16 SYNC STATUS: OK', 'success');
                logToTerminal(`  Hex clock color value: ${hexVal}`, 'output');
                logToTerminal('  AI Chat Companion state: IDLE', 'output');
                logToTerminal('  Warp Drive Matrix factor: 1.00c', 'output');
                logToTerminal('=======================================', 'system');
                speakCopilot(`CHRONOVERSE X16 synchronized successfully. The current hexadecimal coordinate is ${hexVal}.`);
                break;
                
            case '/model':
                if (args.length < 2) {
                    logToTerminal('Error: Model parameter required. Usage: /model [model_name]', 'error');
                    speakCopilot("Error: please specify a valid model name target.");
                } else {
                    const modelName = args[1];
                    const activeModelEl = document.getElementById('active-model-name');
                    const ollamaStatusEl = document.querySelector('#status-ollama .status-text');
                    
                    activeModelEl.textContent = modelName;
                    ollamaStatusEl.textContent = `OLLAMA: ${modelName.toUpperCase()}`;
                    
                    logToTerminal(`>> Switching Ollama model context to: ${modelName}`, 'system');
                    logToTerminal(`>> Initializing weights for ${modelName}...`, 'system');
                    logToTerminal(`Model load successful. ${modelName} active on port 11434.`, 'success');
                    speakCopilot(`Ollama model updated successfully. Activating ${modelName} neural layers.`);
                }
                break;
                
            case '/system':
                logToTerminal('=======================================', 'system');
                logToTerminal('HARDWARE AND LOGISTICS SUMMARY:', 'system');
                logToTerminal('  Host Platform: Apple Silicon macOS Sonoma', 'output');
                logToTerminal('  Inference Core: Metal Shaders Active (GPU)', 'output');
                logToTerminal('  Active Conda env: (nexus-env) -> /miniconda3/envs/nexus-env', 'output');
                logToTerminal('  Workspace path: /Users/anuragkuamr/98ftxqhq6h-del /home deshbord', 'output');
                logToTerminal('  Hardware health: THERMAL COOL (34°C)', 'success');
                logToTerminal('=======================================', 'system');
                speakCopilot("Diagnostic logs compiled. Processing pipelines are cool and normal.");
                break;
                
            case '/voice':
                toggleMicRecording();
                break;
                
            case '/clear':
                const terminalOutput = document.getElementById('terminal-output');
                terminalOutput.innerHTML = '<div class="terminal-line system">&gt;&gt; Terminal history memory wiped. Ready.</div>';
                speakCopilot("Console buffer cleared.");
                break;
                
            case '/launch':
                if (args.length < 2) {
                    logToTerminal('Error: Module target required. Usage: /launch [vscode|github|ollama|market-brain|telegram]', 'error');
                    speakCopilot("Error: please specify a launcher target.");
                } else {
                    const moduleName = args[1].toLowerCase();
                    handleModuleLaunch(moduleName);
                }
                break;
                
            case 'vscode':
            case 'code':
                handleModuleLaunch('vscode');
                break;
                
            case 'github':
            case 'git':
                handleModuleLaunch('github');
                break;
                
            case 'ollama':
                handleModuleLaunch('ollama');
                break;
                
            default:
                // Ollama Mock NLP request
                logToTerminal(`>> Querying model for NLP response...`, 'system');
                logToTerminal(`>> Prompt: "${inputStr}"`, 'output');
                setTimeout(() => {
                    logToTerminal(`Ollama model response: I am processing your prompt: "${inputStr}". Connecting with local Python backend to execute.`, 'success');
                    speakCopilot(`I've received your query "${inputStr}". How else can I assist in the nexus-env?`);
                }, 1200);
                break;
        }
        
    }, 1000);
}

// Fetch dynamic Hex color based on current clock hour/min/sec (sci-fi trick)
function getHexClockColor() {
    const now = new Date();
    const hexH = String(Math.round(now.getHours() * 10.5)).padStart(2, '0');
    const hexM = String(Math.round(now.getMinutes() * 4.2)).padStart(2, '0');
    const hexS = String(Math.round(now.getSeconds() * 4.2)).padStart(2, '0');
    return `#${hexH}${hexM}${hexS}`;
}

/* ==========================================================================
   8. AI CORE SOUNDWAVE ANIMATIONS (Idle, Listening, Thinking, Speaking)
   ========================================================================== */
let currentCoreState = 'idle'; // idle | listening | thinking | speaking
let coreVisualTimer = null;

function initAICoreVisualizer() {
    const canvas = document.getElementById('core-waves');
    const coreWrapper = document.getElementById('jarvis-core');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let w = canvas.width = canvas.clientWidth;
    let h = canvas.height = canvas.clientHeight;
    
    // Core waves dynamic arrays
    let phase = 0;
    
    // Clicking Core toggles Listening state
    coreWrapper.addEventListener('click', () => {
        toggleMicRecording();
    });
    
    function drawCoreWave() {
        w = canvas.width = canvas.clientWidth;
        h = canvas.height = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);
        
        const cx = w / 2;
        const cy = h / 2;
        
        phase += 0.05;
        
        if (currentCoreState === 'idle') {
            // Draw smooth breathing circle ring
            const radius = 38 + Math.sin(phase * 0.5) * 3;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 247, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Tiny inner glow
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 247, 0.05)';
            ctx.fill();
            
        } else if (currentCoreState === 'listening') {
            // Active sinusoidal wave rings expanding
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#00fff7';
            
            const numWaves = 3;
            for (let i = 0; i < numWaves; i++) {
                ctx.beginPath();
                const amp = 8 + (i * 4) + Math.sin(phase * 2 + i) * 3;
                const baseRad = 32 + (i * 12);
                
                for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
                    // Fluctuate radius on specific angle intervals
                    const offset = Math.sin(angle * 8 + phase * 3 + i) * amp;
                    const r = baseRad + offset;
                    const x = cx + Math.cos(angle) * r;
                    const y = cy + Math.sin(angle) * r;
                    
                    if (angle === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.strokeStyle = `rgba(0, 255, 247, ${0.8 - i * 0.25})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
            ctx.shadowBlur = 0; // Reset
            
        } else if (currentCoreState === 'thinking') {
            // Hexagon expanding rings and rotating lines
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#b829ff';
            
            // Rotating central nodes
            ctx.strokeStyle = 'rgba(184, 41, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3) + phase;
                const x1 = cx + Math.cos(angle) * 20;
                const y1 = cy + Math.sin(angle) * 20;
                const x2 = cx + Math.cos(angle) * 55;
                const y2 = cy + Math.sin(angle) * 55;
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                
                // Draw nodes on tip
                ctx.fillStyle = '#b829ff';
                ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
            }
            ctx.stroke();
            
            // Concentric purple rings
            ctx.beginPath();
            ctx.arc(cx, cy, 40 + Math.sin(phase * 4) * 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(184, 41, 255, 0.7)';
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            
        } else if (currentCoreState === 'speaking') {
            // Electric blue wave rippling based on text outputs
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#3b82f6';
            
            ctx.beginPath();
            const baseRad = 40;
            for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
                // High frequency speech waves
                const voiceMod = Math.sin(angle * 14 + phase * 6) * (6 + Math.sin(phase * 2) * 5);
                const r = baseRad + voiceMod;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                
                if (angle === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            
            ctx.shadowBlur = 0;
        }
        
        requestAnimationFrame(drawCoreWave);
    }
    
    drawCoreWave();
}

// Function to update visual styles & variables of Core Core wrapper
function setCoreState(state) {
    const coreWrapper = document.getElementById('jarvis-core');
    const indicator = document.getElementById('core-state-indicator');
    const coreStatusText = document.getElementById('core-status-text');
    
    currentCoreState = state;
    
    // Clean classes
    coreWrapper.classList.remove('listening', 'thinking', 'speaking');
    
    switch (state) {
        case 'idle':
            indicator.textContent = 'STATUS: IDLE';
            indicator.style.color = '#00fff7';
            coreStatusText.textContent = 'Idle — awaiting prompt or vocal trigger';
            break;
        case 'listening':
            coreWrapper.classList.add('listening');
            indicator.textContent = 'STATUS: LISTENING';
            indicator.style.color = '#00fff7';
            coreStatusText.textContent = 'Listening... Speak your command clearly';
            break;
        case 'thinking':
            coreWrapper.classList.add('thinking');
            indicator.textContent = 'STATUS: THINKING';
            indicator.style.color = '#b829ff';
            coreStatusText.textContent = 'Analyzing market logs and synaptic weight layers...';
            break;
        case 'speaking':
            coreWrapper.classList.add('speaking');
            indicator.textContent = 'STATUS: SPEAKING';
            indicator.style.color = '#3b82f6';
            coreStatusText.textContent = 'Nexus co-pilot audio speech output active';
            break;
    }
}

// Handle voice toggle activation
function toggleMicRecording() {
    const micBtn = document.getElementById('mic-btn');
    const micIndicator = document.getElementById('status-mic');
    const micText = micIndicator.querySelector('.status-text');
    
    const isRecording = micBtn.classList.toggle('recording');
    
    if (isRecording) {
        micIndicator.classList.add('active');
        micText.textContent = 'MIC ACTIVE';
        setCoreState('listening');
        logToTerminal('Voice Recognition interface initiated. Capturing vocal audio stream...', 'system');
        
        // Auto shutoff listening mock after 5s if they don't say anything
        if (coreVisualTimer) clearTimeout(coreVisualTimer);
        coreVisualTimer = setTimeout(() => {
            if (currentCoreState === 'listening') {
                logToTerminal('Audio stream timeout. Parsed query: "Analyze NVIDIA news"', 'success');
                // Simulate thinking transition
                setCoreState('thinking');
                setTimeout(() => {
                    executeCommand('/news');
                    toggleMicRecording(); // turn off mic
                }, 1000);
            }
        }, 5000);
        
    } else {
        micIndicator.classList.remove('active');
        micText.textContent = 'MIC OFF';
        if (currentCoreState === 'listening') {
            setCoreState('idle');
        }
        logToTerminal('Voice Recognition interface deactivated.', 'system');
    }
}

// Animate text typing inside speech bubbles (Copilot talking)
function speakCopilot(text) {
    const speechBubble = document.getElementById('copilot-speech');
    if (!speechBubble) return;
    
    setCoreState('speaking');
    
    speechBubble.innerHTML = '';
    let i = 0;
    
    // Clean text of characters if any
    const rawText = text.replace(/"/g, '');
    speechBubble.innerHTML = '&ldquo;';
    
    function typeChar() {
        if (i < rawText.length) {
            speechBubble.innerHTML += rawText.charAt(i);
            i++;
            setTimeout(typeChar, 25); // typing speed
        } else {
            speechBubble.innerHTML += '&rdquo;';
            // Return back to idle after speaking is done
            if (coreVisualTimer) clearTimeout(coreVisualTimer);
            coreVisualTimer = setTimeout(() => {
                setCoreState('idle');
            }, 3000);
        }
    }
    
    typeChar();
}

/* ==========================================================================
   9. QUICK LAUNCH INTEGRATION & APP LAUNCHERS
   ========================================================================== */
function initQuickLaunchers() {
    const launchVscode = document.getElementById('launch-vscode');
    const launchGithub = document.getElementById('launch-github');
    const launchOllama = document.getElementById('launch-ollama');
    const launchMarketBrain = document.getElementById('launch-market-brain');
    const launchTelegram = document.getElementById('launch-telegram');
    
    if (launchVscode) {
        launchVscode.addEventListener('click', () => handleModuleLaunch('vscode'));
    }
    if (launchGithub) {
        launchGithub.addEventListener('click', () => handleModuleLaunch('github'));
    }
    if (launchOllama) {
        launchOllama.addEventListener('click', () => handleModuleLaunch('ollama'));
    }
    if (launchMarketBrain) {
        launchMarketBrain.addEventListener('click', () => handleModuleLaunch('market-brain'));
    }
    if (launchTelegram) {
        launchTelegram.addEventListener('click', () => handleModuleLaunch('telegram'));
    }
}

// Unified launcher handler with API endpoints and local fallbacks
async function handleModuleLaunch(moduleName) {
    const terminalOverlay = document.getElementById('terminal-overlay');
    if (terminalOverlay) {
        terminalOverlay.classList.add('visible');
    }
    
    setCoreState('thinking');
    
    const commandMap = {
        'vscode': 'vscode',
        'github': 'github',
        'ollama': 'ollama',
        'market-brain': 'nifty market',
        'telegram': 'telegram alerts check'
    };
    const textPrompt = commandMap[moduleName] || moduleName;
    
    try {
        const response = await fetch("http://127.0.0.1:8080/api/command", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: textPrompt,
                source: "text"
            })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }
        
        const data = await response.json();
        
        logToTerminal(`[LAUNCHER SUCCESS] ${moduleName.toUpperCase()}`, 'system');
        logToTerminal(`>> Action Triggered: ${data.action_taken.toUpperCase()}`, 'system');
        logToTerminal(`>> Provider: ${data.source_model.toUpperCase()}`, 'system');
        logToTerminal(data.reply, 'success');
        speakCopilot(data.reply);
        
    } catch (err) {
        console.warn("Backend offline. Invoking launcher local simulation.", err);
        logToTerminal("[WARNING] Backend API offline. Executing client launcher fallback.", 'error');
        handleModuleLaunchLocal(moduleName);
    }
}

// Local simulation launcher fallback
function handleModuleLaunchLocal(moduleName) {
    setTimeout(() => {
        switch (moduleName) {
            case 'vscode':
                logToTerminal("Executing action: Launch local workspace...", "input");
                logToTerminal(">> Syncing workspace directory: /Users/anuragkuamr/98ftxqhq6h-del /home deshbord", "system");
                logToTerminal(">> Launching Visual Studio Code... environment ready.", "success");
                speakCopilot("Visual Studio Code workspace has been opened.");
                break;
            case 'github':
                logToTerminal("Executing action: Connect git repository...", "input");
                logToTerminal(">> Resolving remote origin path...", "system");
                logToTerminal(">> URL: https://github.com/anurag-nexus/nexus-jarvis-os.git", "output");
                logToTerminal(">> Launching web browser view to GitHub repository...", "system");
                logToTerminal("Connection verified.", "success");
                speakCopilot("Accessing GitHub repository. Git synchronization active.");
                break;
            case 'ollama':
                logToTerminal("Executing action: Query Ollama service...", "input");
                logToTerminal(">> Dialing local instance at http://127.0.0.1:11434...", "system");
                logToTerminal(">> Service node state: ONLINE", "success");
                logToTerminal(">> LLM active weight target: qwen2.5-coder (active)", "output");
                logToTerminal(">> Standby nodes: deepseek-r1:14b", "output");
                logToTerminal("Inference engine operational.", "success");
                speakCopilot("Ollama local service is operational. Active model set to qwen2.5-coder.");
                break;
            case 'market-brain':
                logToTerminal("Executing action: Open Market Brain...", "input");
                logToTerminal(">> Spawning Python server process: market_pulse.py...", "system");
                logToTerminal(">> Initializing Ollama sentiment tokenizers...", "system");
                logToTerminal(">> Analytics feed connected.", "success");
                speakCopilot("Market Brain financial analyzer is active.");
                break;
            case 'telegram':
                logToTerminal("Executing action: Check Telegram Notifications...", "input");
                logToTerminal(">> Fetching Telegram bot webhook logs...", "system");
                logToTerminal(">> Status: ACTIVE", "success");
                logToTerminal(">> Channel sync: 0 new alerts queue in #nexus-signals", "output");
                logToTerminal("Notification listener online.", "success");
                speakCopilot("Telegram notifications synced. Listener is active.");
                break;
            default:
                logToTerminal(`Error: Launcher target '${moduleName}' is not valid.`, "error");
                speakCopilot(`Error: launcher target ${moduleName} not found.`);
                break;
        }
    }, 800);
}
