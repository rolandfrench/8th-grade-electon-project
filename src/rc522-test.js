const SPI = require('pi-spi');

// Initialize SPI 0.0
const rc522 = SPI.initialize('/dev/spidev0.0');
rc522.clockSpeed(500000); // 500kHz

// RC522 Register Addresses (shifted for the protocol)
const VERSION_REG = 0x37 << 1; 

/**
 * Reads a register from the RC522
 * Protocol: (Address << 1) | 0x80 for Read
 */
function readRegister(reg, callback) {
    const cmd = Buffer.from([reg | 0x80, 0x00]);
    rc522.transfer(cmd, cmd.length, (err, data) => {
        if (err) return console.error("SPI Error:", err);
        callback(data[1]);
    });
}

/**
 * Writes to a register
 * Protocol: (Address << 1) & 0x7E for Write
 */
function writeRegister(reg, value) {
    const cmd = Buffer.from([reg & 0x7E, value]);
    rc522.write(cmd, (err) => {
        if (err) console.error("Write Error:", err);
    });
}

// 1. Perform a Soft Reset via SPI Command
writeRegister(0x01 << 1, 0x0F); 

// 2. Wait for chip to wake up and check version
setTimeout(() => {
    readRegister(VERSION_REG, (version) => {
        console.log("---------------------------------------");
        console.log(`RC522 Raw Register Check`);
        console.log(`Version Reg (0x37): 0x${version.toString(16)}`);
        
        if (version === 0x91 || version === 0x92) {
            console.log("Status: ONLINE (Authentic chip detected)");
        } else if (version === 0x88) {
            console.log("Status: ONLINE (Clone chip detected)");
        } else {
            console.log("Status: OFFLINE (Check wiring/RST pin)");
        }
        console.log("---------------------------------------");
    });
}, 100);