import sys
import os

# --- PATH FIX ---
# This forces Python to look in your venv's specific library folder
VENV_PATH = "/home/roland/rfid_env/lib/python3.13/site-packages"
if VENV_PATH not in sys.path:
    sys.path.insert(0, VENV_PATH) 

try:
    import board
    import busio
    import adafruit_neopixel_spi as neopixel
    import math
except ImportError as e:
    print(f"Critical Error: {e}")
    print(f"Looking in: {sys.path}")
    sys.exit(1)

# --- CONFIGURATION ---
# Use SPI1 to avoid needing 'sudo'
# DIN -> GPIO 20 (Pin 38)
spi = busio.SPI(board.D21, MOSI=board.D20)
pixels = neopixel.NeoPixel_SPI(spi, 3, brightness=0.5, auto_write=False)

TRIGGER_FILE = ".alert"

def get_color(t):
    # Hot Pink (255, 0, 150) to Electric Blue (0, 50, 255)
    r = int(255 * (1 - t))
    g = int(50 * t)
    b = int(150 + (105 * t))
    return (r, g, b)

step = 0
print("LED Manager Active (SPI1 / No Sudo)")

while True:
    if os.path.exists(TRIGGER_FILE):
        os.remove(TRIGGER_FILE)
        pixels.fill((255, 255, 255))
        pixels.show()
        time.sleep(0.2)

    for i in range(3):
        # The 2.0 offset creates the circling 'chase' effect
        t = (math.sin(step + (i * 2.0)) + 1) / 2
        pixels[i] = get_color(t)
    
    pixels.show()
    step += 0.1
    time.sleep(0.02)