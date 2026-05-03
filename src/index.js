const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { spawn } = require('child_process');
const pythonExe = path.join(__dirname, 'env', 'bin', 'python3');
const scriptPath = path.join(__dirname, 'bridge.py');

let mainWindow;
let pythonBridge = null;

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

/**
 * Starts the RFID process if it isn't already running.
 */
function startRFID() {
    if (pythonBridge) {
        console.log("RFID: Already running.");
        return;
    }

    const pythonExe = path.join(__dirname, 'env', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'bridge.py');

    // Spawn the process
    pythonBridge = spawn(pythonExe, [scriptPath], {
        detached: true,
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    pythonBridge.stdout.on('data', (data) => {
        const tagId = data.toString().trim();
        if (tagId === "READY") {
            console.log("Hardware: RFID Reader is active.");
        } else {
            console.log(`Hardware: Scanned Tag ${tagId}`);
            // Logic to handle tag internally in Main
            handleScannedData(tagId);
        }
    });

    pythonBridge.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonBridge.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        pythonBridge = null; // Reset reference so it can be restarted
    });
}

function handleScannedData(tagId) {
    // Send the data to the UI (Renderer)
    if (mainWindow) {
        mainWindow.webContents.send('from-python', tagId);
    }
}

/**
 * Stops the RFID process gracefully.
 */
function stopRFID() {
    if (pythonBridge) {
        console.log("RFID: Stopping process...");

        if (pythonBridge) {
            // The minus sign (-) before the pid kills the entire process group
            process.kill(-pythonBridge.pid, 'SIGTERM');
            pythonBridge = null;
        }
    } else {
        console.log("RFID: Nothing to stop.");
    }
}

let isGameRunning = false;
let activeGame = '';

function launchGame(gameName) {
    if (isGameRunning || activeGame == gameName) return; // Ignore scans if a game is already open

    // Once we get what we need, shut it down
    stopRFID();

    isGameRunning = true;
    activeGame = gameName;
    mainWindow.hide(); // Hide your Electron UI

    let romPath = `/home/roland/roms/${gameName}.gba`;
    console.log("romPath:: ", romPath);

    const retroarch = spawn('retroarch', [
        '-c', '~/kiosk.cfg',
        '-L', '/usr/lib/aarch64-linux-gnu/libretro/mgba_libretro.so',
        romPath,
        '-f'
    ]);

    //retroarch -c ~/kiosk.cfg -L /usr/lib/aarch64-linux-gnu/libretro/mgba_libretro.so /home/roland/Downloads/minish.gba -f

    retroarch.on('close', () => {
        isGameRunning = false;
        activeGame = '';
        startRFID();
        mainWindow.show();
        mainWindow.focus();
    });
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();
    startRFID();

    // Debug
    // setTimeout(() => (launchGame('minish')), 10000);

    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Option A: One-way communication (Fire and forget)
ipcMain.on('launch-game', (event, data) => {
    console.log("Received from renderer:", data);
    launchGame(data);
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
