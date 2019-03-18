'use strict';
const Omega2Gpio = require('omega2-gpio'),
  gpio = new Omega2Gpio();

gpio.tests()
  .then(() => {
      // Output pins (digital)
      let outputStepper = gpio.pin({
        pin: 1,
        mode: 'output',
        debugging: true
      });

      let outputDir = gpio.pin({
        pin: 0,
        mode: 'output',
        debugging: true
      });

      // Get value
      console.log(outputStepper.get());
      console.log(outputDir.get());

      console.log('value is printed');

      const spr = 200; // steps per revolution 360/7.5
      const cw = 1;
      const ccw = 0;
      const timeoutval = 0.028 * 1000;

      outputDir.set(true);

      function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
          if ((new Date().getTime() - start) > milliseconds){
            break;
          }
        }
      }

      for (let i = 0; i < spr; i++) {
        outputStepper.set(true);
        sleep(timeoutval);
        outputStepper.set(false);
        sleep(timeoutval);
      }


      // let blink = true;
      // let blinkInterval = setInterval(() => {
      //   console.log((blink ? '^_^' : '-_-') + '\n');
      //   outputStepper.set(blink);
      //   // outputDir.set(blink);
      //   blink = !blink;
      // }, 500);

      // Stop blinking after a while
      // setTimeout(() => {
      //   clearInterval(blinkInterval);
      //   outputStepper.set(false);
      //   // outputDir.set(false);
      // }, 4000);
  });