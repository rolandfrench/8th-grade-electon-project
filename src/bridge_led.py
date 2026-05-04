import sys
import os
import time
import math
import signal
import argparse  # Added for CLI parameters
from pathlib import Path

# --- PATH FIX ---
venv_pkgs = Path("/home/roland/rfid_env/lib/python3.13/site-packages")
if venv_pkgs.exists():
    sys.path.insert(0, str(venv_pkgs))

import board
import busio
import neopixel_spi

# --- ARGUMENT PARSING ---
parser = argparse.ArgumentParser(description="Cyberpunk LED Bridge")
# Add arguments for two colors (each takes 3 integers: R G B)
parser.add_argument('--color1', nargs=3, type=int, default=[255, 0, 150], 
                    help='First RGB color (e.g., 255 0 150)')
parser.add_argument('--color2', nargs=3, type=int, default=[0, 50, 255], 
                    help='Second RGB color (e.g., 0 50 255)')
args = parser.parse_args()

c1 = args.color1
c2 = args.color2

# --- LED SETUP ---
spi = busio.SPI(board.D21, MOSI=board.D20)
pixels = neopixel_spi.NeoPixel_SPI(spi, 3, brightness=0.5, auto_write=False)

def cleanup_and_exit(signum, frame):
    pixels.fill((0, 0, 0))
    pixels.show()
    sys.exit(0)

signal.signal(signal.SIGTERM, cleanup_and_exit)
signal.signal(signal.SIGINT, cleanup_and_exit)

TRIGGER_FILE = ".alert"

def get_color(t):
    """Interpolates between the two CLI-provided colors"""
    r = int(c1[0] * (1 - t) + c2[0] * t)
    g = int(c1[1] * (1 - t) + c2[1] * t)
    b = int(c1[2] * (1 - t) + c2[2] * t)
    return (r, g, b)

step = 0
print(f"Looping between {c1} and {c2}...")

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
    pixels.fill((0, 0, 0))
    pixels.show()
    print(f"Error: {e}")