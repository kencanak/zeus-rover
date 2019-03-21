'use strict'
const pwmExp = require('/usr/bin/node-pwm-exp');
const EventEmitter = require('events');

class PWM extends EventEmitter {
  constructor(pwm_frequency) {
    super();

    this._pwmFrequency = pwm_frequency;
    this.pwm = pwmExp;

    this.pwm.setFrequency(this._pwmFrequency);

    this.init();

    this.on('pwm_initialized', () => {
      console.info('pwm initialized');
    });

    this.on('pwm_initializing', () => {
      console.info('pwm initializing');
    });

    this.on('pin_setup', (text) => {
      console.info(text);
    });

    this.on('pwm_off', () => {
      console.info('pwm off');
    });
  }

  init() {
    if (this.pwm.checkInit()) {
      this.emit('pwm_initialized');
    } else {
      this.emit('pwm_initializing');
      this.pwm.driverInit();
    }
  }

  setPwmDriver(pin, duty_cycle, delay) {
    console.log('pin:', pin);
    console.log('duty_cycle:', duty_cycle);
    console.log('delay:', delay);
    this.pwm.setupDriver(pin, duty_cycle, delay, () => {
      this.emit('pin_setup', 'channel ' + pin + ' set dutycycle: ' + duty_cycle);
    });
  }

  turnOffPwm() {
    this.pwm.disableChip();
    this.emit('pwm_off');
  }

  pwmStatus() {
    return this.pwm.checkInit();
  }
}

module.exports = PWM;