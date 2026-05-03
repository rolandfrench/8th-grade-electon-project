const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { spawn } = require('child_process');
const pythonExe = path.join(__dirname, 'env', 'bin', 'python3');
const scriptPath = path.join(__dirname, 'bridge.py');

let mainWindow;
let pythonBridge;

function createWindow() {
    mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
    
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

const bridge = spawn(pythonExe, [scriptPath], {
    stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin, pipe out/err
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
});

bridge.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output === "READY") {
        console.log("Python Bridge is confirmed ALIVE and scanning.");
    } else {
        console.log("Tag Scanned:", output);
        // Send to your Renderer window
        if (mainWindow) mainWindow.webContents.send('rfid-data', output);
    }
});

bridge.stderr.on('data', (data) => {
    console.error(`Python Logic Error: ${data}`);
});

// Handling the RFID request
ipcMain.handle('get-rfid-tag', async () => {
  console.log("Main process: Starting scan...");
  try {
    
    // Point to the Python executable inside your new virtual environment
    const pythonPath = path.join(__dirname, 'env', 'bin', 'python3');
    const pythonProcess = spawn(pythonPath, ['bridge.py'], {
        env: { 
            ...process.env, 
            PYTHONUNBUFFERED: "1" // This forces Python to send data immediately
        }
    });

    console.log("-----------------------------------------");
    console.log("NODE-PYTHON VENV BRIDGE ACTIVE");
    console.log(`Using Python: ${pythonPath}`);
    console.log("-----------------------------------------");

    pythonProcess.stdout.on('data', (data) => {
        console.log("\x1b[32m%s\x1b[0m", `*** TAG RECEIVED: ${data.toString().trim()} ***`);
        return data.toString().trim();
    });

    pythonProcess.stderr.on('data', (data) => {
        // We ignore the library warnings, but log actual errors
        const msg = data.toString();
        if (msg.includes('Error')) console.error(`Python Error: ${msg}`);
    });

    process.on('SIGINT', () => {
        pythonProcess.kill();
        process.exit();
    });
    
  } catch (err) {
    console.error("RFID Error:", err);
    return { error: err.message };
  }
});

// THE STARTUP LOGIC
function startPythonBridge() {
    const pythonExe = path.join(__dirname, 'env', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'bridge.py');

    // Spawn the process
    pythonBridge = spawn(pythonExe, [scriptPath], {
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    pythonBridge.stdout.on('data', (data) => {
        const tagId = data.toString().trim();
        if (tagId === "READY") {
            console.log("Hardware: RFID Reader is active.");
        } else {
            console.log(`Hardware: Scanned Tag ${tagId}`);
            // Send the data to the UI (Renderer)
            if (mainWindow) {
                mainWindow.webContents.send('from-python', tagId);
            }
        }
    });

    pythonBridge.stderr.on('data', (data) => {
        console.error(`Python Logic Error: ${data}`);
    });
}

let isGameRunning = false;
let activeGame = '';

function launchGame(gameName) {
    if (isGameRunning || activeGame == gameName) return; // Ignore scans if a game is already open
    
    isGameRunning = true;
    activeGame = gameName;
    //mainWindow.hide(); // Hide your Electron UI

    let romPath = `/home/roland/roms/${gameName}.gba`;
    console.log("romPath:: ", romPath);

    const retroarch = spawn('retroarch', [
        '-c', '~/kiosk.cfg',
        '-L', '/home/roland/snap/retroarch/current/.config/retroarch/cores/mgba_libretro.so',
        romPath,
        '-f'
    ]);

    retroarch.on('close', () => {
        isGameRunning = false;
        activeGame = '';
        // mainWindow.show();
        // mainWindow.focus();
    });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  startPythonBridge();

  setTimeout(() => (launchGame('launchGame')), 10000);

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
