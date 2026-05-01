const SPI = require('pi-spi');
const spi = SPI.initialize('/dev/spidev0.0');
spi.clockSpeed(500000); // 500kHz

// MFRC522 Hex Commands
const Commands = {
    REQC: 0x26,      // Request Command
    ANTICOLL: 0x93,  // Anticollision
    TRANSCEIVE: 0x0C // Data transfer command
};

// MFRC522 Registers
const Regs = {
    FIFOData: 0x09,
    Command: 0x01,
    BitFraming: 0x0D,
    FIFOLevel: 0x0A
};

/**
 * Basic SPI communication helpers
 */
function writeReg(addr, val) {
    const buf = Buffer.from([(addr << 1) & 0x7E, val]);
    spi.write(buf, () => {});
}

function readReg(addr) {
    return new Promise(res => {
        const buf = Buffer.from([(addr << 1) & 0x7E | 0x80, 0]);
        spi.transfer(buf, (err, data) => res(data[1]));
    });
}

/**
 * The Scan Logic
 */
async function requestTag() {
    writeReg(Regs.Command, 0x00);         // Idle
    writeReg(Regs.FIFOLevel, 0x80);       // Clear FIFO
    writeReg(Regs.FIFOData, Commands.REQC);
    writeReg(Regs.Command, Commands.TRANSCEIVE);
    writeReg(Regs.BitFraming, 0x87);      // Start transmission

    // Wait a tiny bit for hardware response
    await new Promise(r => setTimeout(r, 50));

    const level = await readReg(Regs.FIFOLevel);
    return level > 0; // If FIFO has data, a card replied!
}

async function getUID() {
    writeReg(Regs.FIFOLevel, 0x80);
    writeReg(Regs.FIFOData, Commands.ANTICOLL);
    writeReg(Regs.FIFOData, 0x20); // NVB (Number of Valid Bits)
    writeReg(Regs.Command, Commands.TRANSCEIVE);
    writeReg(Regs.BitFraming, 0x00);

    await new Promise(r => setTimeout(r, 50));

    const level = await readReg(Regs.FIFOLevel);
    if (level >= 5) {
        const uid = [];
        for (let i = 0; i < 4; i++) {
            uid.push((await readReg(Regs.FIFOData)).toString(16).toUpperCase().padStart(2, '0'));
        }
        return uid.join(':');
    }
    return null;
}

// MAIN LOOP
console.log("--- Scanning for Tags ---");
setInterval(async () => {
    if (await requestTag()) {
        const id = await getUID();
        if (id) console.log(`[${new Date().toLocaleTimeString()}] Tag Detected: ${id}`);
    }
}, 500);