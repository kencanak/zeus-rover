import onionGpio
from time import sleep

spr = 200
timeoutval = 0.028

gpioStepper  = onionGpio.OnionGpio(1)

stepperDirection = gpioStepper.getDirection()

for x in range(200):
  status = gpioStepper.setOutputDirection(1)
  print gpioStepper.getValue()
  sleep(timeoutval)
  status = gpioStepper.setOutputDirection(0)
  print gpioStepper.getValue()
  sleep(timeoutval)