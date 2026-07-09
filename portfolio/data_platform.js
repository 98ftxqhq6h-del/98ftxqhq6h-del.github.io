document.addEventListener('DOMContentLoaded', () => {

  const OLLAMA_HOST = 'http://localhost:11434';

  // ─── CLOCK LOOPS ───────────────────────────────────────────
  function updateClock() {
    const sysTimeNode = document.getElementById('sysTime');
    if (sysTimeNode) {
      sysTimeNode.textContent = new Date().toLocaleTimeString();
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ─── SYSTEM OVERLAYS ────────────────────────────────────────
  function loadSystemTelemetry() {
    document.getElementById('sysLocale').textContent = navigator.language || 'en-US';
    document.getElementById('sysScreen').textContent = `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}dpr)`;
    document.getElementById('sysPlatform').textContent = navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform || 'macOS';
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    document.getElementById('sysRtt').textContent = connection && connection.rtt ? `${connection.rtt} ms` : 'N/A';
  }
  loadSystemTelemetry();

  // ─── DATA FETCHING & POLLING LOOPS ──────────────────────────
  let cachedCoordinates = null;

  async function refreshTelemetry() {
    // 1. Geoloc API lookup
    let geo = null;
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        geo = await res.json();
        document.getElementById('geoCity').textContent = geo.city || 'N/A';
        document.getElementById('geoCountry').textContent = `${geo.region_code || ''}, ${geo.country_name || ''}`;
        document.getElementById('geoLat').textContent = geo.latitude ? geo.latitude.toFixed(4) : 'N/A';
        document.getElementById('geoLon').textContent = geo.longitude ? geo.longitude.toFixed(4) : 'N/A';
        document.getElementById('geoIsp').textContent = geo.org || 'N/A';
        
        cachedCoordinates = { lat: geo.latitude, lon: geo.longitude };
      }
    } catch (e) {
      document.getElementById('geoCity').textContent = 'FETCH ERROR';
      document.getElementById('geoCountry').textContent = 'OFFLINE';
    }

    // 2. Meteorological Sensors (Weather)
    if (cachedCoordinates || (geo && geo.latitude)) {
      const lat = cachedCoordinates ? cachedCoordinates.lat : geo.latitude;
      const lon = cachedCoordinates ? cachedCoordinates.lon : geo.longitude;
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        if (res.ok) {
          const wea = await res.json();
          const curr = wea.current_weather;
          
          document.getElementById('weaTemp').textContent = `${curr.temperature} °C`;
          document.getElementById('weaWind').textContent = `${curr.windspeed} km/h`;
          document.getElementById('weaCode').textContent = `CODE_${curr.weathercode}`;
          document.getElementById('weaState').textContent = resolveWeatherCode(curr.weathercode);
        }
      } catch (e) {
        document.getElementById('weaTemp').textContent = 'SENSOR ERROR';
      }
    }

    // 3. Cryptographic Ledger
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
      if (res.ok) {
        const crypto = await res.json();
        document.getElementById('coinBtc').textContent = `$${crypto.bitcoin.usd.toLocaleString()}`;
        document.getElementById('coinEth').textContent = `$${crypto.ethereum.usd.toLocaleString()}`;
        document.getElementById('coinSol').textContent = `$${crypto.solana.usd.toLocaleString()}`;
      }
    } catch (e) {
      document.getElementById('coinBtc').textContent = 'LEDGER OFFLINE';
    }

    // 4. Local Ollama Active Cores
    const ollamaList = document.getElementById('ollamaList');
    try {
      const res = await fetch(`${OLLAMA_HOST}/api/tags`);
      if (res.ok) {
        const data = await res.json();
        const models = data.models || [];
        
        ollamaList.innerHTML = '';
        if (models.length === 0) {
          ollamaList.innerHTML = '<li>CORE ONLINE // 0 MODELS REGISTERED</li>';
        } else {
          models.forEach(m => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="lbl">${m.name.toUpperCase()}:</span> <span>${(m.size / (1024 * 1024 * 1024)).toFixed(2)} GB</span>`;
            ollamaList.appendChild(li);
          });
        }
      } else {
        throw new Error('Offline');
      }
    } catch (e) {
      ollamaList.innerHTML = '<li class="mono" style="color: var(--neon-red);">&gt; OLLAMA CORE DISCONNECTED</li>';
    }
  }

  // Weather code helper
  function resolveWeatherCode(code) {
    if (code === 0) return 'CLEAR_SKIES';
    if ([1, 2, 3].includes(code)) return 'PARTLY_CLOUDY';
    if ([45, 48].includes(code)) return 'FOG_OVERLAY';
    if ([51, 53, 55].includes(code)) return 'DRIZZLE';
    if ([61, 63, 65].includes(code)) return 'ACTIVE_RAIN';
    if ([71, 73, 75].includes(code)) return 'SNOWFALL';
    if ([80, 81, 82].includes(code)) return 'RAIN_SHOWERS';
    if ([95, 96, 99].includes(code)) return 'THUNDERSTORM';
    return 'UNKNOWN_STATE';
  }

  // Initial load and periodic poll every 10 seconds
  refreshTelemetry();
  setInterval(refreshTelemetry, 10000);

});
