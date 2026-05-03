import sys
from unittest.mock import MagicMock
# Mock the broken library so it doesn't crash the script
sys.modules["RPi"] = MagicMock()
sys.modules["RPi.GPIO"] = MagicMock()

import time
from pirc522 import RFID

import signal
def signal_handler(sig, frame):
    # Perform hardware cleanup here (close serial port, etc)
    sys.exit(0)
signal.signal(signal.SIGTERM, signal_handler)

# ... your RFID loop ...

# Initialize the library
# bus=0, device=0 corresponds to /dev/spidev0.0
rc522 = RFID(bus=0, device=0, pin_rst=25) 

print("BRIDGE_READY")
sys.stdout.flush()

def run():
    while True:
        # Request a tag
        (error, tag_type) = rc522.request()
        
        if not error:
            # Collision detection (pulls the UID)
            (error, uid) = rc522.anticoll()
            if not error:
                # Format UID as a string
                id_str = "".join([str(x) for x in uid])
                print(id_str)
                sys.stdout.flush()
                # Cooldown to prevent double-reads
                time.sleep(1)
        
        time.sleep(0.1)

try:
    run()
except Exception as e:
    sys.stderr.write(f"Error: {str(e)}\n")
    sys.exit(1)