// Establish WebSocket connection
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
let socket = new WebSocket(wsUrl);

// HTML elements
const statusText = document.getElementById('status-text');
const statusIndicator = document.querySelector('.status-indicator');
const dialogueBox = document.getElementById('dialogue-box');
const waveform = document.getElementById('waveform');
const micBtn = document.getElementById('mic-btn');
const instructionPrompt = document.getElementById('instruction-prompt');
const textQueryInput = document.getElementById('text-query');
const sendBtn = document.getElementById('send-btn');

let isRecording = false;
let speechRecognizer = null;
let speechSynthesizer = window.speechSynthesis;
let currentUtterance = null;

// Speech Recognition setup (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;
  speechRecognizer.lang = 'en-US';

  speechRecognizer.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    waveform.classList.remove('hidden');
    instructionPrompt.textContent = 'LISTENING...';
    // Stop any speaking when starting a new capture
    if (speechSynthesizer.speaking) {
      speechSynthesizer.cancel();
    }
  };

  speechRecognizer.onend = () => {
    isRecording = false;
    micBtn.classList.remove('recording');
    waveform.classList.add('hidden');
    instructionPrompt.textContent = 'TAP TO TALK';
  };

  speechRecognizer.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    if (speechResult.trim()) {
      appendMessage('user', speechResult);
      sendQuery(speechResult);
    }
  };

  speechRecognizer.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    appendMessage('assistant', `*clicks claws in concern* Oops! I had trouble hearing that: ${event.error}`);
  };
} else {
  instructionPrompt.textContent = 'VOICE NOT SUPPORTED';
  micBtn.disabled = true;
}

// Socket Lifecycle
socket.onopen = () => {
  statusText.textContent = 'ONLINE';
  statusIndicator.classList.add('connected');
};

socket.onclose = () => {
  statusText.textContent = 'OFFLINE';
  statusIndicator.classList.remove('connected');
  // Auto retry connection
  setTimeout(() => {
    socket = new WebSocket(wsUrl);
  }, 3000);
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'reply') {
    appendMessage('assistant', data.text);
    speak(data.text);
  }
};

function sendQuery(text) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({
      type: 'text_query',
      text: text
    }));
  } else {
    appendMessage('assistant', `*wiggles antennae* Sorry, we got disconnected. Reconnecting...`);
  }
}

function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;
  msgDiv.innerHTML = `<p>${text}</p>`;
  dialogueBox.appendChild(msgDiv);
  dialogueBox.scrollTop = dialogueBox.scrollHeight;
}

// Text interaction
sendBtn.addEventListener('click', () => {
  const text = textQueryInput.value.trim();
  if (text) {
    appendMessage('user', text);
    sendQuery(text);
    textQueryInput.value = '';
  }
});

textQueryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendBtn.click();
  }
});

// Mic button toggle
micBtn.addEventListener('click', () => {
  if (!speechRecognizer) return;
  if (isRecording) {
    speechRecognizer.stop();
  } else {
    speechRecognizer.start();
  }
});

// Text-to-speech output
function speak(text) {
  if (!speechSynthesizer) return;
  
  // Clean text from markdown formatting (e.g. *, #, etc.) for cleaner voice output
  const cleanText = text.replace(/[*#_`~]/g, '');

  if (speechSynthesizer.speaking) {
    speechSynthesizer.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(cleanText);
  
  // Try to find a nice English speaking voice
  const voices = speechSynthesizer.getVoices();
  const niceVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
  if (niceVoice) {
    currentUtterance.voice = niceVoice;
  }

  currentUtterance.rate = 1.05; // Slightly faster to feel snappier
  currentUtterance.pitch = 1.0; // Playful pitch

  speechSynthesizer.speak(currentUtterance);
}
// Trigger voice list load (sometimes empty on initial page loads in Chrome)
if (speechSynthesizer && speechSynthesizer.onvoiceschanged !== undefined) {
  speechSynthesizer.onvoiceschanged = () => speechSynthesizer.getVoices();
}
