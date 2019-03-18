'use strict';
const Stepper = require('./stepper');
const Servo = require('./servo');
const utils = require('./utils');

// initiate servo at channel 0 pwm
const servo = new Servo(500, 2500, 0);
let angles = [0, 90, 180];
let index = 0;
// setInterval(() => {
//   if (index >= angles.length) {
//     index = 0;
//   }
//   servo.setAngle(angles[index]);
//   index++;
// }, 2000);

const stepper = new Stepper(1, 0);
stepper.init()
  .then((res) => {
    let direction = 1;
    let angle = 0;
    // stepper.setDirection(direction);
    // stepper.rotate();
    stepper.setSpeed(200);
    stepper.setDirection(direction);
    stepper.move(200);
    stepper.on('complete', () => {
      console.log('DONE');
      setTimeout(() => {
        direction = direction === 0 ? 1 : 0;
        stepper.setDirection(0);
        stepper.move(200);
      }, 1000);
    });
  })
  .catch((err) => {
    console.log(err);
  });