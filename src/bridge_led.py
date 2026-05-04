import sys
import os
import time
import math
import signal # Added for SIGTERM
from pathlib import Path

# --- PATH FIX ---
venv_pkgs = Path("/home/roland/rfid_env/lib/python3.13/site-packages")
if venv_pkgs.exists():
    sys.path.insert(0, str(venv_pkgs))

import board
import busio
import neopixel_spi

# --- LED SETUP ---
spi = busio.SPI(board.D21, MOSI=board.D20)
pixels = neopixel_spi.NeoPixel_SPI(spi, 3, brightness=0.5, auto_write=False)

def cleanup_and_exit(signum, frame):
    """Turns off LEDs and exits gracefully"""
    print(f"\nStopping LED process (Signal: {signum})...")
    pixels.fill((0, 0, 0))
    pixels.show()
    sys.exit(0)

# Register the signals to our cleanup function
signal.signal(signal.SIGTERM, cleanup_and_exit) # For systemctl stop
signal.signal(signal.SIGINT, cleanup_and_exit)  # For Ctrl+C

TRIGGER_FILE = ".alert"

def get_color(t):
    r = int(255 * (1 - t))
    g = int(50 * t)
    b = int(150 + (105 * t))
    return (r, g, b)

step = 0
print("Cyberpunk Circle Active. Waiting for SIGTERM or Ctrl+C to clean up...")

try:
    while True:
        if os.path.exists(TRIGGER_FILE):
            os.remove(TRIGGER_FILE)
            pixels.fill((255, 255, 255))
            pixels.show()
            time.sleep(0.2)

        for i in range(3):
            t = (math.sin(step + (i * 2.0)) + 1) / 2
            pixels[i] = get_color(t)
        
        pixels.show()
        step += 0.1 
        time.sleep(0.02)

except Exception as e:
    # Just in case something else breaks, turn off the lights
    pixels.fill((0, 0, 0))
    pixels.show()
    print(f"Error: {e}")