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

    try {
      const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: text,
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
