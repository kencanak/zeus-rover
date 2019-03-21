'use strict';
const PWM = require('./pwm');

class Motor extends PWM {
  /**
   * @param {Object} pins - with following props
   *                        {
   *                          left_in1: left input 1,
   *                          left_in2: left input 2,
   *                          left_pwm: left pwm,
   *                          right_in1: right input 1,
   *                          right_in2: right input 2,
   *                          right_pwm: right pwm
   *                        }
   */
  constructor(pins) {
    super(50);

    this._pins = pins;

    console.info('motor pins');
    console.info(this._pins);

    this.on('stopped', () => {
      console.info('motor stopped');
    });

    this.on('cruising', () => {
      console.info('motor cruising');
    });
  }

  _cruise(speed_right, speed_left) {
    this.emit(!speed_left && !speed_right ? 'stopped' : 'cruising');

    // send pwm signal to right wheels
    this.setPwmDriver(this._pins.right_pwm, speed_right, 0);

    // send pwm signal to left wheels
    this.setPwmDriver(this._pins.left_pwm, speed_left, 0);
  }

  _setDirection(forward, reverse) {
    this.setPwmDriver(this._pins.left_in1, forward ? 100 : 0, 0);
    this.setPwmDriver(this._pins.left_in2, reverse ? 100 : 0, 0);

    this.setPwmDriver(this._pins.right_in2, reverse ? 100 : 0, 0);
    this.setPwmDriver(this._pins.right_in1, forward ? 100 : 0, 0);
  }

  stop() {
    this._cruise(0, 0);
  }

  /**
   * this method is used for directing motor movement
   * @param {float} x - nipple js x position
   * @param {float} y - nipple js y position
   */
  move(x, y) {
    const forward = y < 0;
    const reverse = y > 0;

    // compute the speed for each side of motors
    const speedRight = Math.min(100, Math.max(0, (Math.abs(y) - x)));
    const speedLeft = Math.min(100, Math.max(0, (Math.abs(y) + x)));

    // set motor direction
    this._setDirection(forward, reverse);

    // set motor cruising speed
    this._cruise(speedRight, speedLeft);

    return {
      right: speedRight,
      left: speedLeft
    };
  }
}

module.exports = Motor;