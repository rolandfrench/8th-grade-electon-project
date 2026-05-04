import os
import time
import math
import board
import busio
import adafruit_neopixel_spi as neopixel

# Setup SPI1: MOSI is GPIO 20 (Pin 38)
# We don't need MISO or SCLK for LEDs, but the library needs the object
spi = busio.SPI(board.D21, MOSI=board.D20) 

# Initialize 3 LEDs
pixels = neopixel.NeoPixel_SPI(spi, 3, brightness=1.0, auto_write=False)

TRIGGER_FILE = ".alert"

def get_color(t):
    # Pink (255, 0, 150) to Blue (0, 50, 255)
    r = int(255 * (1 - t))
    g = int(50 * t)
    b = int(150 + (105 * t))
    return (r, g, b)

step = 0
offset = 2.0

print("LED Process Running on SPI1 (No Sudo!)...")

try:
    while True:
        if os.path.exists(TRIGGER_FILE):
            os.remove(TRIGGER_FILE)
            pixels.fill((255, 255, 255))
            pixels.show()
            time.sleep(0.2)

        for i in range(3):
            t = (math.sin(step + (i * offset)) + 1) / 2
            pixels[i] = get_color(t)
        
        pixels.show()
        step += 0.1 
        time.sleep(0.02)

except KeyboardInterrupt:
    pixels.fill((0, 0, 0))
    pixels.show()