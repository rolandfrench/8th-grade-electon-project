const SPI = require('pi-spi');

// Open the hardware SPI device on Pi 5
const spi = SPI.initialize('/dev/spidev0.0');
spi.clockSpeed(1e6); // 1MHz

console.log("--- Pi 5 RFID Raw Access ---");

function readRegister(addr) {
    return new Promise((resolve) => {
        // MFRC522 address format: (addr << 1) & 0x7E | 0x80
        const buffer = Buffer.from([(addr << 1) & 0x7E | 0x80, 0]);
        spi.transfer(buffer, (err, data) => {
            resolve(data[1]);
        });
    });
}

async function checkReader() {
    // Read the Version register (0x37)
    const version = await readRegister(0x37);
    if (version === 0x00 || version === 0xFF) {
        console.log("Reader NOT found. Check wiring!");
    } else {
        console.log(`Reader Found! Version: 0x${version.toString(16)}`);
        console.log("The hardware is communicating correctly.");
    }
}

checkReader();