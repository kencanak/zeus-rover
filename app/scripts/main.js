'use strict';

const onButton = document.getElementById('on-btn');
const offButton = document.getElementById('off-btn');
const speedLeft = document.getElementById('speed-left');
const speedRight = document.getElementById('speed-right');
const joystickContainer = document.getElementById('joystick');

var sendMessageTimeout = null;

// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

var ws = new WebSocket('ws://' + WEBSOCKET_SERVER + ':1337');

function onload() {
  initialiseWebSocket();
  initialiseJoystick();
  bindEvents();
}

function initialiseJoystick() {
  var options = {
    zone: joystickContainer,
    color: 'white',
    mode: 'static',
    size: 100,
    position: {left: '50%', top: '50%'},
  };

  var joystick = nipplejs.create(options);
  var joystickPosition = joystick.get().position;

  joystick.on('end', function(event, data) {
    sendMessage('stop');
  }).on('move', function(evt, data) {
    var dataPos = data.position;
    var y = (dataPos.y - joystickPosition.y) * 2;
    var x = (dataPos.x - joystickPosition.x) * 2;

    sendMessage('move', x, y);
  });
}

function initialiseWebSocket() {
  ws.onopen = function () {
    // connection is opened and ready to use
    console.log('web socket connection opened');
  };

  ws.onerror = function (error) {
    console.log('error from websocket');
    console.log(error);
    // an error occurred when sending/receiving data
  };

  ws.onmessage = function (message) {
    const engineStatus = JSON.parse(message.data);

    if (engineStatus.engine) {
      onButton.classList.add('button--active');
      offButton.classList.remove('button--active');
    } else {
      onButton.classList.remove('button--active');
      offButton.classList.add('button--active');
    }

    speedLeft.textContent = engineStatus.speedLeft;
    speedRight.textContent = engineStatus.speedRight;
  };
}

function bindEvents() {
  var buttons = document.querySelectorAll('button');

  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    button.addEventListener('click', buttonClickEvent, false);
  }
}

function buttonClickEvent(e) {
  var message = e.target.getAttribute('data-msg');
  sendMessage(message);
}

function sendMessage(task, x, y) {
  if (sendMessageTimeout) {
    clearTimeout(sendMessageTimeout);

    sendMessageTimeout = null;
  }

  if (task !== 'move') {
    ws.send(JSON.stringify({
      task: task,
    }));
    return;
  }

  sendMessageTimeout = setTimeout(() => {
    ws.send(JSON.stringify({
      task: task,
      x: x,
      y: y
    }));
  }, 50);
}

window.addEventListener('DOMContentLoaded', onload, true);