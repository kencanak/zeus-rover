const pwmExp = require('/usr/bin/node-pwm-exp');

const CHANNELS = {
  leftMotorIN1: 6,
  leftMotorIN2: 7,
  leftMotorPwm: 5,
  rightMotorIN1: 9,
  rightMotorIN2: 8,
  rightMotorPwm: 10,
  redLed: 3,
  yellowLed: 2,
  greenLed: 1,
};

var isOn = false;
var isStopped = false;
var isBackward = false;

pwmExp.setFrequency(1526);

const engineStatus = () => {
  return pwmExp.checkInit();
};

const on = (boot) => {
  console.log('motor on');

  if (pwmExp.checkInit()) {
    console.log('Oscillator sucessfull initialized');
  } else {
    console.warn('oscillator initializing');
    pwmExp.driverInit();
  }

  if (boot) {
    light('all');

    setTimeout(() => {
      light('off');
    }, 3000);
  }

  isOn = true;
};

const off = () => {
  console.log('motor off');
  pwmExp.disableChip();
  light('off');
  isOn = false;
};

const cruise = (speedRight, speedLeft) => {
  if (!isOn) {
    on();
  }

  pwmExp.setupDriver(CHANNELS.leftMotorPwm, speedLeft, 0, () => {
    console.log('channel ' + CHANNELS.leftMotorPwm + ' set');
  });


  pwmExp.setupDriver(CHANNELS.rightMotorPwm, speedRight, 0, () => {
    console.log('channel ' + CHANNELS.rightMotorPwm + ' set');
  });

  if (speedRight === 0 && speedLeft === 0 && !isStopped) {
    light('stop');
    isStopped = true;
  } else {
    isStopped = false;
  }
};

const light = (type) => {
  var red = 0;
  var yellow = 0;
  var green = 0;

  switch (type) {
    case 'stop':
      red = 50;
      break;
    case 'reverse':
      yellow = 50;
      break;
    case 'move':
      green = 50;
      break;
    case 'all':
      green = 50;
      yellow = 50;
      red = 50;
      break;
  }

  pwmExp.setupDriver(CHANNELS.redLed, red, 0, () => {
    console.log('led red:' + red);
  });

  pwmExp.setupDriver(CHANNELS.yellowLed, yellow, 0, () => {
    console.log('led yellow:' + yellow);
  });

  pwmExp.setupDriver(CHANNELS.greenLed, green, 0, () => {
    console.log('led green:' + green);
  });
};

const move = (x, y) => {
  if (!isOn) {
    on();
  }

  const forward1 = y < 0;
  const forward2 = y > 0;

  if (forward1 && isBackward) {
    light('move');
    isBackward = false;
  } else if (!forward1 && !isBackward) {
    light('reverse');
    isBackward = true;
  }

  pwmExp.setupDriver(CHANNELS.leftMotorIN1, forward1 ? 100 : 0, 0, () => {
    console.log('left motor 1:' + forward1);
  });

  pwmExp.setupDriver(CHANNELS.leftMotorIN2, forward2 ? 100 : 0, 0, () => {
    console.log('left motor 2:' + forward2);
  });


  pwmExp.setupDriver(CHANNELS.rightMotorIN2, forward1 ? 100 : 0, 0, () => {
    console.log('right motor 1:' + forward1);
  });

  pwmExp.setupDriver(CHANNELS.rightMotorIN1, forward2 ? 100 : 0, 0, () => {
    console.log('right motor 2:' + forward2);
  });

  var speedRight = Math.min(100, Math.max(0, (Math.abs(y) - x)));
  var speedLeft = Math.min(100, Math.max(0, (Math.abs(y) + x)));

  cruise(speedRight, speedLeft);

  return {
    right: speedRight,
    left: speedLeft
  };
};

module.exports = {
  on: on,
  off: off,
  move: move,
  cruise: cruise,
  engineStatus: engineStatus,
  light: light
};