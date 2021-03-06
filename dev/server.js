"use strict";
var socket,
	players = [];
var Player = function(nickname, startX, startY, type) {
	var nick = nickname,
		x = startX,
		y = startY,
		angle = 5,
		shipType = type,
		id;
	var getX = function() {
		return x;
	};
	var getY = function() {
		return y;
	};
	var getAngle = function() {
		return angle;
	};
	var getType = function() {
		return shipType;
	};
	var getNick = function() {
		return nick;
	};
	var setX = function(newX) {
		x = newX;
	};
	var setY = function(newY) {
		y = newY;
	};
	var setAngle = function(newAngle) {
		angle = newAngle;
	};
	var setType = function(newType) {
		shipType = newType;
	};
	return {
		getX: getX,
		getY: getY,
		getAngle: getAngle,
		getType: getType,
		getNick: getNick,
		setX: setX,
		setY: setY,
		setAngle: setAngle,
		setType: setType,
		id: id
	}
};
function onClientDisconnect() {
	console.log("Player has disconnected: "+this.id);
	var removePlayer = playerById(this.id);
	if (!removePlayer) {
		console.log("Player not found: "+this.id);
		return;
	};
	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("remove player", {id: this.id});
};
function onNewPlayer(data) {
	var shiptype = Math.floor(Math.random() * 9) + 0 ;
	var newPlayer = new Player(data.nick, data.x, data.y, data.type);
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {nick: data.nick, id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), angle: newPlayer.getAngle(), type: newPlayer.getType()});
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {nick: existingPlayer.getNick(), id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), angle: existingPlayer.getAngle(), type: existingPlayer.getType()});
	};
	players.push(newPlayer);
};
function onMovePlayer(data) {
	var movePlayer = playerById(this.id);
	if (!movePlayer) {
		console.log("Player not found: "+this.id);
		return;
	};
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setAngle(data.angle);
	movePlayer.setType(data.type);
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), angle: movePlayer.getAngle(), type: movePlayer.getType(), isFiring: data.isFiring});
};
function onRejoin(data) {
	var rejoinedPlayer = playerById(this.id);
	if (!rejoinedPlayer) {
		console.log("Player not found: "+this.id);
		return;
	};
	this.broadcast.emit("rejoin", {id: rejoinedPlayer.id});
};
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};
	return false;
};
module.exports = function (socket) {
	console.log("New player has connected: "+socket.id);
	socket.on("disconnect", onClientDisconnect);
	socket.on("new player", onNewPlayer);
	socket.on("move player", onMovePlayer);
	socket.on("rejoin", onRejoin);
};