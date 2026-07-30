const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0e14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Load local compiled file, or dev server if --dev flag is active
  const isDev = process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  // Open developer tools
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start local FastAPI server as a child process
function startFastAPIServer() {
  const backendPath = path.join(__dirname, '../backend/main.py');
  
  // Launch backend server (using local python environment)
  pythonProcess = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[FastAPI]: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[FastAPI Error]: ${data}`);
  });
}

app.whenReady().then(() => {
  startFastAPIServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Terminate FastAPI child process on exit
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});
