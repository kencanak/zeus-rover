'use strict'
const pwmExp = require('/usr/bin/node-pwm-exp');
// ref: http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf

class Servo {
  constructor(minPulse, maxPulse, channel) {
    this._minPulse = minPulse;
    this._maxPulse = maxPulse;
    this._channel = channel;
    this._period = 20000;

    this._minAngle = 0;
    this._maxAngle = 180;

    // note the min and max pulses (in microseconds)
    // calculate the total range
    this._range = this._maxPulse - this._minPulse;

    // calculate the us / degree
    this._step = this._range / 180;

    pwmExp.setFrequency(50);

    if (pwmExp.checkInit()) {
      console.log('Oscillator sucessfull initialized');
    } else {
      console.warn('oscillator initializing');
      pwmExp.driverInit();
    }
  }

  setAngle(angle) {
    // make sure angle value is within range
    if (angle < this._minAngle) {
      angle = this._minAngle;
    } else if (angle > this._maxAngle) {
      angle = this._maxAngle;
    }

    // For a specified angle, the pulse width = minimum pulse width + (angle * pulse width per degree)
    // compute pulse width
    const pulseWidth = this._minPulse + (angle * this._step);

    // to compute duty cycle, pulseWidth / period
    const dutyCycle = (pulseWidth * 100) / this._period;

    pwmExp.setupDriver(this._channel, dutyCycle, 0, () => {
      console.log('channel ' + this._channel + ' set dutycycle: ' + dutyCycle);
    });
  }
}

module.exports = Servo;