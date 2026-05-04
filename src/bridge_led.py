import sys
import os
import time
import math
import board
import busio
import neopixel_spi  # The filename we found with 'ls'

# Setup SPI1 (Pin 38 for Data, Pin 40 for Clock - though WS2812 ignores clock)
spi = busio.SPI(board.D21, MOSI=board.D20)

# Initialize the 3 LEDs
pixels = neopixel_spi.NeoPixel_SPI(spi, 3, brightness=0.5, auto_write=False)

TRIGGER_FILE = ".alert"

def get_color(t):
    """Interpolates between Hot Pink (255,0,150) and Electric Blue (0,50,255)"""
    r = int(255 * (1 - t))
    g = int(50 * t)
    b = int(150 + (105 * t))
    return (r, g, b)

step = 0
print("Cyberpunk Circle Active (Running on SPI1)...")

try:
    while True:
        # Check for the 'Handshake' file from the RFID script
        if os.path.exists(TRIGGER_FILE):
            os.remove(TRIGGER_FILE)
            pixels.fill((255, 255, 255)) # Flash White
            pixels.show()
            time.sleep(0.2)

        # The 'Circle' Logic
        for i in range(3):
            # Offset of 2.0 makes the 3 LEDs look like they are chasing
            t = (math.sin(step + (i * 2.0)) + 1) / 2
            pixels[i] = get_color(t)
        
        pixels.show()
        step += 0.1 
        time.sleep(0.02)

except KeyboardInterrupt:
    pixels.fill((0, 0, 0))
    pixels.show()