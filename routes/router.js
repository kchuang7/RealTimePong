var express = require('express');
var router = express.Router();
var shortid = require('shortid');

var sio = require('../socket.io.server.js');

/* GET Home page. */
router.get('/', function(req, res) {
	res.render('main.ejs', {});
});

/* POST Room page. Creates new socket.io room */
router.post('/room', function(req, res) {
	res.json({ success : true, room : shortid.generate() });
});

/* GET Room page. */
router.get('/room/:roomId', function(req, res) {
	res.render('game.ejs', { roomFull : sio.roomFull(req.params.roomId) });
});

// catch 404
router.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

module.exports = router;
