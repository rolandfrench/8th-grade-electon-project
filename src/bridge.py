import sys
import time
import signal
from unittest.mock import MagicMock

from pirc522 import RFID

# Mock the broken library so it doesn't crash the script
sys.modules["RPi"] = MagicMock()
sys.modules["RPi.GPIO"] = MagicMock()

# Initialize hardware
rc522 = RFID(bus=0, device=0, pin_rst=25)

def cleanup_and_exit(sig, frame):
    """Gracefully shuts down the hardware before exiting."""
    try:
        rc522.cleanup() # Important: Releases GPIO pins
    except:
        pass
    sys.exit(0)

# Register both termination signals
signal.signal(signal.SIGTERM, cleanup_and_exit) # Sent by pythonBridge.kill()
signal.signal(signal.SIGINT, cleanup_and_exit)  # Sent by Ctrl+C

def run():
    # Signal to Node.js that the loop is starting
    print("READY") 
    sys.stdout.flush()

    while True:
        (error, tag_type) = rc522.request()
        
        if not error:
            (error, uid) = rc522.anticoll()
            if not error:
                # Convert UID to hex or string
                id_str = "".join([str(x) for x in uid])
                print(id_str)
                sys.stdout.flush()
                
                # Cooldown to prevent multiple reads of the same tag
                time.sleep(1.5)
        
        # Small sleep to prevent 100% CPU usage
        time.sleep(0.1)

if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.stderr.flush()
        sys.exit(1)