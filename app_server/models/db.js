/*
var mongoose = require('mongoose');
var dbURL = 'mongodb://lhprivac@129.6.100.207/BGPDB';

mongoose.connect(dbURL);

mongoose.connection.on('connected', function(){
	console.log('Mongoose connected to '+ dbURL);
});

mongoose.connection.on('error', function(err){
        console.log('Mongoose connected error '+ err);
});

mongoose.connection.on('disconnected', function(){
        console.log('Mongoose disconnected');
});

var gracefulShutdown = function(msg, callback){
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through '+ msg);
		callback();
	});
};

process.on('SIGINT', function(){
	gracefulShutdown('app termination', function(){
		process.exit(0);
	});
});
*/
var mongoose = require('mongoose');

mongoose.connect('mongodb://lhprivac@129.6.100.207/BGPDB').then(() => {
console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR!!! ", err);
});
