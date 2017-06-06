// connect to socket.io server
var socket = io.connect();

socket.on('connect', function() {
  console.log('Connected to socket.io server.');
});

/* Graphics & Game Loop */

var canvas = document.getElementById('playCanvas');
var ctx = canvas.getContext('2d');

var opponentScore = document.getElementById('opponentScore');
var selfScore = document.getElementById('selfScore');

var y1 = 0; // opponent paddle position
var y2 = 0; // player paddle position
var bx = 512, by = 300; // ball coordinates

// send paddle position update to server
document.onmousemove = function(e) {
  var paddleCenter = e.pageY - 135;
  // only updates paddle position if cursor is in play canvas
  if (e.target.id === 'playCanvas' && paddleCenter >= 0 && paddleCenter <= 480) {
    y2 = paddleCenter;
    socket.emit('paddle', paddleCenter);
  }
} // end onmousemove

// polyfilled requestAnimationFrame at 60 FPS
window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame        ||
          window.webkitRequestAnimationFrame  ||
          window.mozRequestAnimationFrame     ||
          window.oRequestAnimationFrame       ||
          window.msRequestAnimationFrame      ||
          function (callback) {
            window.setTimeout(callback, 1000/60);
          };
})(); // end requestAnimFrame

// update canvas draw state
function draw() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw player paddle
  ctx.beginPath();
  ctx.rect(984, y2, 15, 120);
  ctx.fillStyle = 'cyan';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();

  // draw opponent paddle
  ctx.beginPath();
  ctx.rect(20, y1, 15, 120);
  ctx.fillStyle = 'magenta';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke(); 

  // draw ball
  ctx.beginPath();
  ctx.arc(bx, by, 10, 0, 6.283184, false);
  ctx.fillStyle = '#383B3E';
  ctx.fill();

} // end draw

// game loop
function gameloop() {
  requestAnimFrame(gameloop);
  draw();
}

// start game
gameloop();

// update game state upon reception of new data from room game loop on server
socket.on('tick', function(data) {
  y1 = data.y;
  bx = data.bx;
  by = data.by;
});

// restarts match and updates scores upon a player's win condition
socket.on('newMatch', function(data) {
  switch (data) {
    case 'win':
      selfScore.innerHTML = parseInt(selfScore.innerHTML)+1;
      break;
    case 'loss':
      opponentScore.innerHTML = parseInt(opponentScore.innerHTML)+1;
      break;
  }
});