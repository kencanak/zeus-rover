'use strict';
const Stepper = require('./stepper');
const Servo = require('./servo');
const PWM = require('./pwm');

const RED_LED_PIN = 1;
const YELLOW_LED_PIN = 2;


const CHANNELS = {
  leftMotorIN1: 6,
  leftMotorIN2: 7,
  leftMotorPwm: 5,
  rightMotorIN1: 9,
  rightMotorIN2: 8,
  rightMotorPwm: 10,
};

const pwm = new PWM(50);

const stepper = new Stepper(1, 0);
// initiate servo at channel 0 pwm
const servo = new Servo(500, 2500, 0);

let ledInterval = null;
let servoInterval = null;

const moveMotor = () => {
  pwm.setPwmDriver(CHANNELS.leftMotorIN1, 0, 0);
  pwm.setPwmDriver(CHANNELS.leftMotorIN2, 100, 0);
  pwm.setPwmDriver(CHANNELS.leftMotorPwm, 100, 0);
  pwm.setPwmDriver(CHANNELS.rightMotorIN1, 0, 0);
  pwm.setPwmDriver(CHANNELS.rightMotorIN2, 100, 0);
  pwm.setPwmDriver(CHANNELS.rightMotorPwm, 100, 0);
}

moveMotor();

const blinkLed = (isRed) => {
  let ledDutyCycle = 100;

  // turn off the other led. only one led to blink at a time
  pwm.setPwmDriver(isRed ? YELLOW_LED_PIN : RED_LED_PIN, 0, 0);

  if (ledInterval) {
    clearInterval(ledInterval);
    ledInterval = null;
  }

  ledInterval = setInterval(() => {
    ledDutyCycle = ledDutyCycle === 100 ? 0 : 100;
    pwm.setPwmDriver(isRed ? RED_LED_PIN : YELLOW_LED_PIN, ledDutyCycle, 0);
  }, 1000);
};

const appExitHandler = () => {
  pwm.setPwmDriver(YELLOW_LED_PIN, 0, 0);
  pwm.setPwmDriver(RED_LED_PIN, 0, 0);
  servo.stop();
  stepper.hold();
  pwm.turnOffPwm();
  servo.turnOffPwm();
  if (ledInterval) {
    clearInterval(ledInterval);
    ledInterval = null;
  }

  if (servoInterval) {
    clearInterval(servoInterval);
    servoInterval = null;
  }
};



let angles = [0, 90, 180];
let index = 0;
servoInterval = setInterval(() => {
  if (index >= angles.length) {
    index = 0;
  }
  servo.setAngle(angles[index]);
  index++;
}, 2000);

stepper.init()
  .then((res) => {
    let direction = 1;
    let angle = 0;
    // stepper.setDirection(direction);
    // stepper.rotate();
    stepper.setSpeed(200);
    stepper.setDirection(direction);
    stepper.move(200);

    blinkLed(direction === 1);
    stepper.on('complete', () => {
      console.log('DONE');
      direction = direction === 0 ? 1 : 0;
      blinkLed(direction === 1);

      setTimeout(() => {
        stepper.setDirection(direction);
        stepper.move(200);
      }, 1000);
    });
  })
  .catch((err) => {
    console.log(err);
  });


//do something when app is closing
process.on('exit', appExitHandler);

//catches ctrl+c event
process.on('SIGINT', appExitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', appExitHandler);
process.on('SIGUSR2', appExitHandler);

//catches uncaught exceptions
process.on('uncaughtException', appExitHandler);