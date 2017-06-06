function GameLoop(sockets) {

	// loop correction vars
	this._now = Date.now();
	this._drift = 0; // in milliseconds
	this._period = 16; // ms
	this._adjPeriod; // period adjusted for drift

	// recursive game loop call
	this._loopTimer;

	// game state variables
	this._y1 = 0; this._y2 = 0; // player paddle positions
	this._br = 10; // ball radius
	this._width = 1024; this._height = 600; // play canvas dimensions

	// private 'that' variable that exposes 'this' object to private methods
	var t = this;

	// self-correcting game loop that updates game state per cycle
	function gameloop() {
		// compensates for setTimeout drift
		t._drift = (Date.now() - t._now) - t._period;
		t._adjPeriod = t._period;
		if (t._drift >= t._period) // drift matches/exceeds entire period
			t._adjPeriod = t._period;
		else if (t._drift > 0)
			t._adjPeriod = t._period - t._drift;
		else if (t.drift < 0)
			t._adjPeriod = t._period + t._drift;
		t._now = Date.now();

		update();

		t._loopTimer = setTimeout(gameloop, t._adjPeriod);
	} // end gameloop

	// initialize ball vars
	function initBall() {
		t._bx1 = 512; // player 1 x coordinate
		t._bx2 = t._bx1; // player 2 x coordinate
		t._by = 300; // everyone's ball y coordinate
		t._vx1 = Math.floor(Math.random() * (5 - 2 + 1)) + 2; // player 1 ball x velocity
		t._vx1 *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // randomly assigns negative value
		t._vx2 = -t._vx1; // player 2 ball x velocity
		t._vy = Math.floor(Math.random() * (5 - 2 + 1)) + 2; // everyone's ball y velocity
		t._vy *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // randomly assigns negative value
	} // end initBall

	// update paddle/ball positions
	function update() {
		// ball bounce off top or bottom
		if (t._by <= t._br || t._by >= t._height-t._br) {
			t._vy = -t._vy;
		}
		// ball velocity speeds up after every paddle bounce
		// ball bounce off player 1's paddle
		else if (t._bx1 >= t._width-50 && t._bx1 < t._width-35 && t._by <= t._y1+120 && t._by >= t._y1) {
			t._vx1 = -t._vx1*1.1;
			t._vx2 = -t._vx2*1.1;
		}
		// ball bounce off player 2's paddle
		else if (t._bx2 >= t._width-50 && t._bx2 < t._width-35 && t._by <= t._y2+120 && t._by >= t._y2) {
			t._vx1 = -t._vx1*1.1;
			t._vx2 = -t._vx2*1.1;
		}
		// ball entered player 2's zone: player 1 win condition
		else if (t._bx1 <= t._br) {
			sockets[0].emit('newMatch', 'win');
			sockets[1].emit('newMatch', 'loss');
			initBall();
		}
		// ball entered player 1's zone: player 2 win condition
		else if (t._bx2 <= t._br) {
			sockets[0].emit('newMatch', 'loss');
			sockets[1].emit('newMatch', 'win');
			initBall();
		}
		// update ball position
		t._bx1 += t._vx1;
		t._bx2 += t._vx2;
		t._by += t._vy;

		// send positions to players
		sockets[0].emit('tick', { 'y' : t._y2, 'bx' : t._bx1, 'by' : t._by });
		sockets[1].emit('tick', { 'y' : t._y1, 'bx' : t._bx2, 'by' : t._by });
	} // end update

	// first gameloop call
	function start() {
		setTimeout(function() {
			initBall();
			gameloop();
		}, t._period);
	} // end private start

	// exposes start function call to self object
	this.start = function() {
		return start();
	} // end privileged start

	// receive player 1 paddle position
	sockets[0].on('paddle', function(paddleTop) {
		t._y1 = paddleTop;
	});

	// receive player 2 paddle position
	sockets[1].on('paddle', function(paddleTop) {
		t._y2 = paddleTop;
	});

	// kills game loop and disassociates all socket listeners
	function stop() {
		clearTimeout(t._loopTimer);
		sockets[0].removeAllListeners();
		sockets[1].removeAllListeners();
	} // end private stop

	// exposes stop function call to self object
	this.stop = function() {
		return stop();
	} // end privileged stop

} // end GameLoop constructor

GameLoop.prototype.start = function() {
	this.start();
}; // end prototypal start

// kill recursive game loop
GameLoop.prototype.stop = function() {
	this.stop();
}; // end prototypal stop

module.exports = GameLoop;