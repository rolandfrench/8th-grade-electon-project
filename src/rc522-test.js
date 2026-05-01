const RPiMfrc522 = require('rpi-mfrc522');

// Initialize with default SPI settings (device 0.0)
let mfrc522 = new RPiMfrc522();

async function run() {
  try {
    await mfrc522.init();
    console.log("Reader ready. Scan a card...");

    while (true) {
      if (await mfrc522.cardPresent()) {
        let uid = await mfrc522.antiCollision();
        if (uid) {
          console.log('Card detected! UID:', uid.join(':'));
          // Add your logic here (e.g., check against a database)
        }
        await mfrc522.resetPCD(); // Reset for next scan
      }
      // Small delay to prevent CPU pinning
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();