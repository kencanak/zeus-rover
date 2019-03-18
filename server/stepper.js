'use strict';
const Omega2Gpio = require('omega2-gpio');
const EventEmitter = require('events');
const NanoTimer = require('nanotimer');

// ref: https://www.youtube.com/watch?v=LUbhPKBL_IU
// ref: https://github.com/mikedamage/wpi-stepper/blob/master/es6/lib/stepper.js

class Stepper extends EventEmitter {
  constructor(stepperPin, directionPin) {
    super();
    this._stepperPin = stepperPin;
    this._directionPin = directionPin;

    // steps per revolution
    this._steps = 200;

    this._currentSpr = 0;

    this._gpio = new Omega2Gpio();

    this._outputStepper = null;
    this._outputDirection = null;

    this._moveTimer = new NanoTimer();
    this.moving = false;
    this.direction = 1;

    this.stepNum = 0;

    this.on('power', () => {
      console.info({ powered: this._powered }, 'power toggled');
    });
    this.on('speed', () => {
      console.info({ rpms: this._rpms, stepDelay: this._stepDelay }, 'speed changed');
    });
    this.on('hold', () => {
      console.info('holding position');
    });
    this.on('start', (direction, steps) => {
      console.info({ direction, steps }, 'starting motion');
    });
    this.on('stop', () => {
      console.info('stopping');
    });
    this.on('cancel', () => {
      console.info('cancelling previous motion');
    });
    this.on('move', (direction, phase, pinStates) => {
      console.info({ direction, phase, pinStates }, 'move one step');
    });
    this.on('complete', () => {
      console.info({ numSteps: this._numSteps }, 'motion complete');
    });

    // GPIO pin activation sequence
    this._MODES = [ 1, 0, 1, 0 ];
  }

  // The maximum speed at which the motor can rotate (as dictated by our
  // * timing resolution). _Note: This is not your motor's top speed;
  getMaxSpeed() {
    return 60 * 1e6 / this._steps;
  }

  // Returns the absolute value of the current motor step
  getAbsoluteStep() {
    return Math.abs(this.stepNum);
  }

  getSpeed() {
    return this._rpms;
  }

  setSpeed(rpm) {
    this._rpms = rpm;

    if (this._rpms > this.getMaxSpeed()) {
      this._rpms = this.getMaxSpeed();
    }

    this._stepDelay = this.getMaxSpeed() / this._rpms;

    /**
     * Speed change event
     * @event Stepper#speed
     * @param {number} rpms - The current RPM number
     * @param {number} stepDelay - The current step delay in microseconds
     */
    this.emit('speed', this._rpms, this._stepDelay);
  }

  /**
   * Stop moving the motor and hold position\
   */
  hold() {
    this._stopMoving();
    this.emit('hold');
  }

  _stopMoving() {
    this._resetMoveTimer();
    this.moving = false;
  }

  _powerDown() {
    this._outputStepper.set(0);
    this._outputDirection.set(0);
    this.emit('power', false);
  }

  _resetMoveTimer() {
    this._moveTimer.clearInterval();
  }

  _countStep(direction) {
    this.stepNum += direction;

    if (this.stepNum >= this.steps) {
      this.stepNum = 0;
    } else if (this.stepNum < 0) {
      this.stepNum = this.steps - 1;
    }

    return this.getAbsoluteStep() % this._MODES.length;
  }

  _setPinStates() {
    for (let val of this._MODES) {
      this._outputStepper.set(val);

      if (!this._powered && val === 1) {
        this._powered = true;
        this.emit('power', true);
      }
    }
  }

  init() {
    return new Promise((resolve, reject) => {
      this._gpio.tests()
        .then(() => {
          this._outputStepper = this._gpio.pin({
            pin: this._stepperPin,
            mode: 'output',
            debugging: true
          });

          this._outputDirection = this._gpio.pin({
            pin: this._directionPin,
            mode: 'output',
            debugging: true
          });

          resolve();
        })
        .catch((err) => {
          console.log('unable to init stepper');
          console.log(err);
          reject(err);
        });
    });
  }

  setDirection(direction) {
    this.direction = direction;
    console.log('set direction: ', direction);
    this._outputDirection.set(direction);
  }

  move(stepsToMove) {
    if (stepsToMove === 0) {
      return this.hold();
    }

    if (this.moving) {
      this.emit('cancel');
      this.hold();
    }

    this.moving = true;
    let remaining  = Math.abs(stepsToMove);

    this.emit('start', this.direction, stepsToMove);

    return new Promise((resolve) => {
      this._moveTimer.setInterval(() => {
        if (remaining === 0) {
          this.emit('complete');
          this.hold();
          return resolve(this.stepNum);
        }

        this.step(this.direction);
        remaining--;
      }, '', `${this._stepDelay}u`);
    });
  }

  /**
   * Move the motor one step in the given direction
   */
  step(direction) {
    this._setPinStates();

    this.emit('move', direction, this._MODES);

    return this.stepNum;
  }
}

module.exports = Stepper;