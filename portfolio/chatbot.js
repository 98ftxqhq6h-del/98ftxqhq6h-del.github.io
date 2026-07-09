document.addEventListener('DOMContentLoaded', () => {

  const OLLAMA_HOST = 'http://localhost:11434';
  
  // HTML Nodes references
  const statusIndicator = document.getElementById('statusIndicator');
  const modelSelect = document.getElementById('modelSelect');
  const systemMsg = document.getElementById('systemMsg');
  const chatFeed = document.getElementById('chatFeed');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  let isConnecting = false;
  let connectionTimer = null;

  // Cache geographical coordinates to prevent redundant IP API lookups
  let cachedGeo = null;

  // ─── MODEL DISCOVERY (OLLAMA HANDSHAKE) ────────────────────
  async function checkOllamaConnection() {
    if (isConnecting) return;
    isConnecting = true;

    try {
      const response = await fetch(`${OLLAMA_HOST}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models || [];

        // Connection successful
        statusIndicator.textContent = 'ONLINE';
        statusIndicator.className = 'status online';
        systemMsg.textContent = `> COALESCED LOCAL MODELS DETECTED: [${models.length} CORES]`;
        systemMsg.style.color = '#39ff14';

        // Populate dropdown menu options
        modelSelect.innerHTML = '';
        if (models.length === 0) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = 'NO LOCAL MODELS DOWNLOADED';
          modelSelect.appendChild(opt);
          userInput.disabled = true;
          sendBtn.disabled = true;
        } else {
          models.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.name;
            opt.textContent = `${m.name} (${(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB)`;
            modelSelect.appendChild(opt);
          });
          userInput.disabled = false;
          sendBtn.disabled = false;
          userInput.placeholder = "ENTER SYSTEM QUERY...";
        }

        // Cancel retry cycle if running
        if (connectionTimer) {
          clearInterval(connectionTimer);
          connectionTimer = null;
        }
      }
    } catch (err) {
      // Offline fallback status
      statusIndicator.textContent = 'OFFLINE';
      statusIndicator.className = 'status offline';
      systemMsg.textContent = '> OLLAMA OFFLINE. START OLLAMA LOCAL SERVER FOR NEURAL LINK';
      systemMsg.style.color = '#ff3b30';

      modelSelect.innerHTML = '<option value="">OLLAMA ENGINE OFFLINE</option>';
      userInput.disabled = true;
      sendBtn.disabled = true;
      userInput.placeholder = "OLLAMA ENGINE OFFLINE. SYSTEM SUSPENDED...";

      // Setup retry poll cycle if not active
      if (!connectionTimer) {
        connectionTimer = setInterval(checkOllamaConnection, 5000);
      }
    } finally {
      isConnecting = false;
    }
  }

  // Initial connection check
  checkOllamaConnection();

  // ─── RAG: REAL-TIME DATA COLLECTORS ─────────────────────────
  async function fetchGeolocInfo() {
    if (cachedGeo) return cachedGeo;
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        cachedGeo = {
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
          isp: data.org
        };
        return cachedGeo;
      }
    } catch (e) {}
    return null;
  }

  async function fetchWeatherInfo(lat, lon) {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (res.ok) {
        const data = await res.json();
        return {
          temp: data.current_weather.temperature,
          windspeed: data.current_weather.windspeed,
          weathercode: data.current_weather.weathercode
        };
      }
    } catch (e) {}
    return null;
  }

  async function fetchCryptoPrices() {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      if (res.ok) {
        const data = await res.json();
        return {
          btc: data.bitcoin.usd,
          eth: data.ethereum.usd,
          sol: data.solana.usd
        };
      }
    } catch (e) {}
    return null;
  }

  // ─── STREAMING GENERATION HANDLING ─────────────────────────
  async function sendMessage() {
    const text = userInput.value.trim();
    const model = modelSelect.value;
    if (!text || !model || isConnecting) return;

    // Add user message bubble
    appendMessage(text, 'user');
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    // Add typing indicator bubble
    const typingBubble = appendTypingIndicator();

    // 🔗 RAG Processor: Check if prompt triggers real-time context collection
    let contextStr = '';
    const queryLower = text.toLowerCase();

    // Trigger A: Time / Date / System
    const triggerTime = queryLower.includes('time') || queryLower.includes('date') || queryLower.includes('clock') || queryLower.includes('today');
    // Trigger B: Geolocation / Location
    const triggerGeo = queryLower.includes('location') || queryLower.includes('where am i') || queryLower.includes('city') || queryLower.includes('country') || queryLower.includes('isp');
    // Trigger C: Weather
    const triggerWeather = queryLower.includes('weather') || queryLower.includes('temperature') || queryLower.includes('temp') || queryLower.includes('rain') || queryLower.includes('forecast');
    // Trigger D: Crypto / Finance
    const triggerCrypto = queryLower.includes('crypto') || queryLower.includes('bitcoin') || queryLower.includes('ethereum') || queryLower.includes('solana') || queryLower.includes('btc') || queryLower.includes('eth') || queryLower.includes('sol');

    try {
      let geoData = null;
      let weatherData = null;
      let cryptoData = null;

      // Parallel Data collection based on triggers
      const promises = [];

      if (triggerGeo || triggerWeather) {
        promises.push((async () => {
          systemMsg.textContent = '> RAG PIPELINE: RESOLVING GEOLOCATION OVERLAYS...';
          geoData = await fetchGeolocInfo();
        })());
      }

      if (triggerCrypto) {
        promises.push((async () => {
          systemMsg.textContent = '> RAG PIPELINE: TRACKING CRYPTOCURRENCY LEDGER...';
          cryptoData = await fetchCryptoPrices();
        })());
      }

      // Wait for primary gathers
      await Promise.all(promises);

      // Secondary gathers (Weather depends on Lat/Lon from Geo lookup)
      if (triggerWeather && geoData) {
        systemMsg.textContent = '> RAG PIPELINE: ACQUIRING REAL-TIME METEOROLOGICAL METRICS...';
        weatherData = await fetchWeatherInfo(geoData.latitude, geoData.longitude);
      }

      // Restore system message status
      systemMsg.textContent = `> COALESCED LOCAL MODELS DETECTED: [${modelSelect.options.length} CORES]`;
      systemMsg.style.color = '#39ff14';

      // Assemble system context block
      contextStr += `[REAL-TIME DATA CONTEXT INJECTED AT ${new Date().toLocaleString()}]\n`;
      contextStr += `- Current Local Time/Date: ${new Date().toString()}\n`;
      contextStr += `- Screen Telemetry: ${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}dpr)\n`;
      
      if (geoData) {
        contextStr += `- User Location: ${geoData.city}, ${geoData.region}, ${geoData.country} (Coordinates: ${geoData.latitude}, ${geoData.longitude})\n`;
        contextStr += `- Network ISP: ${geoData.isp}\n`;
      }
      
      if (weatherData) {
        contextStr += `- Current Weather: ${weatherData.temp}°C, Wind Speed: ${weatherData.windspeed} km/h (Weather Code: ${weatherData.weathercode})\n`;
      }
      
      if (cryptoData) {
        contextStr += `- Current Live Crypto Rates (USD):\n`;
        contextStr += `  * Bitcoin (BTC): $${cryptoData.btc.toLocaleString()}\n`;
        contextStr += `  * Ethereum (ETH): $${cryptoData.eth.toLocaleString()}\n`;
        contextStr += `  * Solana (SOL): $${cryptoData.sol.toLocaleString()}\n`;
      }

      // Assemble prompt with context wrapper
      const assembledPrompt = `
System Context Data:
${contextStr}

Use the above real-time context data if relevant to answer the user's query. If you use it, do not mention that it was "injected" or "provided in the prompt context"; simply respond as if you know it naturally.

User query: ${text}
`;

      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: assembledPrompt,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      // Remove typing indicator and spawn assistant message container
      chatFeed.removeChild(typingBubble);
      const assistantBubble = appendMessage('', 'assistant');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split by newlines (Ollama streams lines of JSON objects)
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Hold onto partial line buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              assistantBubble.textContent += parsed.response;
              chatFeed.scrollTop = chatFeed.scrollHeight;
            }
          } catch (e) {
            // Buffer boundary parsing failure, ignore
          }
        }
      }
      
      // Parse any remaining buffer
      if (buffer.trim()) {
        try {
          const parsed = JSON.parse(buffer);
          if (parsed.response) {
            assistantBubble.textContent += parsed.response;
          }
        } catch(e) {}
      }

    } catch (err) {
      if (chatFeed.contains(typingBubble)) {
        chatFeed.removeChild(typingBubble);
      }
      appendMessage(`SYSTEM ERROR: Unable to communicate with the model core. ${err.message}`, 'system-msg mono');
    } finally {
      userInput.disabled = false;
      sendBtn.disabled = false;
      userInput.focus();
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
  }

  function appendMessage(text, type) {
    const bubble = document.createElement('div');
    bubble.className = `message ${type}`;
    bubble.textContent = text;
    chatFeed.appendChild(bubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return bubble;
  }

  function appendTypingIndicator() {
    const bubble = document.createElement('div');
    bubble.className = 'message assistant';
    bubble.innerHTML = `
      <div class="typing-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;
    chatFeed.appendChild(bubble);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return bubble;
  }

  // Event Listeners for trigger actions
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

});
