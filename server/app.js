const os = require('os');
const http = require('http');
const fs = require('fs');
const WebSocketServer = require('websocket').server;
const path = require('path');
const motor = require('./motor');

const SERVER_HOSTNAME = os.networkInterfaces()['apcli0'][0].address;

const HTTP_SERVER_PORT = 8080;
const WEBSOCKET_SERVER_PORT = 1337;
const WEB_ROOT = path.join(__dirname, '..', 'dist');

const startHttpServer = () => {
  fs.readFile(path.join(WEB_ROOT, 'index.html'), 'utf8', function(error, htmlContent) {
    // this is to update websocket server IP
    const parsedHtmlMatch = htmlContent.match(/WEBSOCKET_SERVER="(.*?)"/gm);
    const parsedHtmlContent = htmlContent.replace(parsedHtmlMatch[0], 'WEBSOCKET_SERVER=\'' + SERVER_HOSTNAME + '\'');

    http.createServer(function (request, response) {
      console.log('request starting...');

      var requestPath = request.url;
      var requestFile = requestPath;
      var contentType = 'text/html';

      if (requestPath === '/') {
        requestFile = 'html';
      } else {
        var extname = path.extname(requestPath);

        switch (extname) {
          case '.js':
              contentType = 'text/javascript';
              break;
          case '.css':
              contentType = 'text/css';
              break;
        }
      }

      if (requestFile === 'html') {
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(parsedHtmlContent, 'utf-8');
      } else {
        fs.readFile(path.join(WEB_ROOT, requestFile), function(error, content) {
          if (error) {
            if(error.code == 'ENOENT'){
              response.writeHead(404, { 'Content-Type': contentType });
              response.end('Content not found', 'utf-8');
            }
            else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end();
            }
          }
          else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
          }
        });
      }
    }).listen(HTTP_SERVER_PORT, SERVER_HOSTNAME, () => {
      console.log(`Server running at http://${SERVER_HOSTNAME}:${HTTP_SERVER_PORT}/`);
    });
  });
};

const startWebSocketServer = () => {
  const websocketServer = http.createServer(function (request, response) {
  }).listen(WEBSOCKET_SERVER_PORT, SERVER_HOSTNAME, () => {
    console.log(`websocket Server running at ws://${SERVER_HOSTNAME}:${WEBSOCKET_SERVER_PORT}/`);
  });

  // create the server
  wsServer = new WebSocketServer({
    httpServer: websocketServer
  });

  // WebSocket server
  wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    console.log('web socket connection request received');

    const sendEngineStatus = (speedLeft, speedRight) => {
      connection.sendUTF(JSON.stringify({
        engine: motor.engineStatus(),
        speedLeft: speedLeft,
        speedRight: speedRight
      }));
    };

    sendEngineStatus(0, 0);

    // message request handler
    connection.on('message', function(message) {
      const data = JSON.parse(message.utf8Data);

      console.log(data);

      switch(data.task) {
        case 'off':
          motor.off();
          break;
        case 'on':
          motor.on(true);
          break;
        case 'stop':
          motor.cruise(0, 0);
          break;
        default:
          const speed = motor.move(data.x, data.y);

          sendEngineStatus(speed.left, speed.right);
          break;
      }

      if (data.task !== 'move') {
        // send latest engine status
        sendEngineStatus(0, 0);
      }
    });

    connection.on('close', function(connection) {
      console.log('websocket connection closed');
      // close user connection

      // off the bot on connection close
      motor.off();
    });
  });
};

const appExitHandler = (e) => {
  console.error('whoops, something is wrong');
  console.error(e);
  motor.off();
  process.exit();
};


startHttpServer();
startWebSocketServer();

//do something when app is closing
process.on('exit', appExitHandler);

//catches ctrl+c event
process.on('SIGINT', appExitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', appExitHandler);
process.on('SIGUSR2', appExitHandler);

//catches uncaught exceptions
process.on('uncaughtException', appExitHandler);