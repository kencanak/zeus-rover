# zeus-rover
Lazy dog rover, using onion omega2

# Motivation
I have a pug called "Zeus", who is super lazy to walk (after 15 mins walk). This rover purpose is to carry him when he feels tired of walking

# Prototype
[![Alt text](https://img.youtube.com/vi/N0mmmJIgTCY/0.jpg)](https://www.youtube.com/watch?v=N0mmmJIgTCY)

# Hardware
1. Onion Omega2
2. Onion Omega2 PWM board
3. L298N DC Motor board
4. Lipo battery 3.7v 1000mAh x 2
5. LED x 3
6. 200 Ω resistors x 3
7. 3D printed wheels, rims, and board
8. Battery juice pack 5v 1000mAh, to power Onion Omega2 for stable performance

# Pre-requisite
At a minimum, you will need the following tools installed:

1. [Git](http://git-scm.com/)
2. [Gulp](https://gulpjs.com/)
3. [Bower](https://bower.io/)
4. Node v4.3.1 and npm v2.14.12 (what's available in Onion Omega2)
5. Onion Omega2 or Pi or any other single board computers

# Getting started
1. run `npm install` and `bower install`
2. run `gulp serve` to view the controller UI on local machine, don't forget to update websocket server address in `app/index.html`
3. run `gulp build`
4. scp both `dist` and `server` directory to the micro computer
5. ssh into the micro computer and run `node [code_directory]/server/app.js`

# App flow
1. Server is an node app, that will run both http and websocket server
2. Connect to board wifi (set as ap mode)
3. Load controller UI from browser `http://[ip address]:8080`
4. Using websocket to communicate with the board, send command to move forward, backward, left, right, stop

# Schematics
TO DO