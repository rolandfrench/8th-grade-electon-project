import os
import time
import math
import board
from adafruit_blinka_raspberry_pi5_neopixel import Pi5Pixelbuf

# Setup
num_pixels = 3
pixel_pin = board.D18
pixels = Pi5Pixelbuf(pixel_pin, num_pixels, auto_write=False)

TRIGGER_FILE = ".alert"

def get_color(t):
    """Interpolates between Hot Pink and Electric Blue"""
    # Pink: (255, 0, 150) | Blue: (0, 50, 255)
    r = int(255 * (1 - t))
    g = int(50 * t)
    b = int(150 + (105 * t))
    return (r, g, b)

print("Cyberpunk Chase Active...")

step = 0
# The 'offset' determines how spread out the colors are.
# With 3 LEDs, 2.0 is a good value to see distinct colors on each.
offset = 2.0 

try:
    while True:
        # RFID Interrupt
        if os.path.exists(TRIGGER_FILE):
            os.remove(TRIGGER_FILE)
            pixels.fill((255, 255, 255))
            pixels.show()
            time.sleep(0.3)

        # Update each LED independently
        for i in range(num_pixels):
            # Calculate a unique 't' for this specific LED
            t = (math.sin(step + (i * offset)) + 1) / 2
            pixels[i] = get_color(t)
        
        pixels.show()
        
        step += 0.1  # Speed of the rotation
        time.sleep(0.03)

except KeyboardInterrupt:
    pixels.fill((0, 0, 0))
    pixels.show()