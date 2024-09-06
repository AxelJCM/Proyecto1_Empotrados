from ctypes import *

# Returns 0 if succesful or -1 in case of error
def pinMode(pin:bytes, mode:bytes):
    so_file = "/usr/lib/libgpio.so.0"
    gpio_func = CDLL(so_file)
    return gpio_func.pinMode(pin, mode)

# Disables the pin
# Returns 0 if succesful or -1 in case of error
def disablePin(pin:bytes):
    so_file = "/usr/lib/libgpio.so.0"
    gpio_func = CDLL(so_file)
    return gpio_func.disablePin(pin)

# Change the digital output of the pin (0 or 1)
# Returns 0 if succesful or -1 in case of error
def digitalWrite(pin:bytes, value:bytes):
    so_file = "/usr/lib/libgpio.so.0"
    gpio_func = CDLL(so_file)
    return gpio_func.digitalWrite(pin, value)

#  Read the digital input value of the pin
#  Returns the read value (0 or 1) or -1 in case of error
def digitalRead(pin:bytes, value):
    so_file = "/usr/lib/libgpio.so.0"
    gpio_func = CDLL(so_file)
    return gpio_func.digitalRead(pin, value)

# Change the digital value of a GPIO at the given frequency (in Hz), 
# for the specified duration (in milliseconds)
# Returns 0 if succesful or -1 in case of error
def blink(pin:bytes, freq:int, duration:int):
    so_file = "/usr/lib/libgpio.so.0"
    gpio_func = CDLL(so_file)
    return gpio_func.blink(pin, freq, duration)

