var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var io = require('socket.io');
var Twit = require('twit');
var searches = {};

var T = new Twit({
   consumer_key: '',
   consumer_secret: '',
   access_token_secret: ''
});

app.use(express.static(path.join(_dirname, 'public')));

app.get('/' function(req, res){
    res.sendFile(_dirname + '/index.html');
});

// Socklets
io.on('connection', function(socket){
   searches[socket.id] = {};

   socket.on('q', function(q){
   	if (!searches[socket.id][q]) {
   		console.log('New Search >>', q);

   		var stream = T.stream('status/filter',{
   			track: q
   		});
   		stream.on('tweet', function(tweet){
   			socket.emit('tweet_' + q, tweet);
   		});

   		stream.on('limit', function(limitMessage){
   			console.log('Limit for User : ' + socket.id + 'on query ' + q + ' has been reached!');
   		});

   		stream.on('warning', function(warning){
         console.log('warning', warning);
   		});

   		//https://dev.twitter.com/streaming/overview/connecting
   		stream.on('reconnect', function(request, response, connectInterval){
           console.log('reconnect :: connectInterval', connectInterval);
   		});

   		stream.on('disconnect', function(disconectMessage){
            console.log('disconnect', disconectMessage);
   		});

   		searches[socket.id][q] = stream;
   	}

   });

   socket.on('remove', function(q){
   	searches[socket.id][q].stop();
   	delete searches[socket.id][q];
   	console.log('Removed Search >>', q);
   });

   socket.on('disconnect', function(){

   	for (var k in searches[socket.id]) {
   		searches[socket.id][k].stop();
   		delete searches[socket.id][k];
   	}

   	delete searches[socket.id];
   	console.log('Removed All Searches from user >>', socket.id);


   });

});

server.listen(4000);


/* 
*
* Line 1-7 : Require dependencies

* Line 9 : Configure the Twitter client. You can get your Twitter client keys by creating a new app or you can follow this to help you setup.
* 
* Line 16 : Set the public folder as a static folder, which we will create in a moment.
* 
* Line 18 : Default route to dispatch index.html, which we will create in a moment.
* 
* Line 23 : We set up Sockets to start listening for a new connection.
* 
* Line 24 : Save the connected client to track and manage.
* 
* Line 25 : When a new query event is received, we will check if the current user has already subscribed to this event. If not, we will create a new stream on line 30.
* 
* Line 34 : When the stream emits a tweet event, socket will emit the same to its client
* 
* Line  39 : Fired when the Limit on the stream has reached.
* 
* Line 43 : Fired when there are any warnings on the stream
* 
* Line 48 : This is triggered when the Twit client tries to reconnect, if connection to Twitter fails.
* 
* PS : This happens when you try to run more than 2 streams parallely. 
* 
* Line 52 : This is triggered when the stream is disconnected.
* 
* Line 56 : We save the current query against the user’s socket id for managing the queries.
* 
* Line 60 : This is the remove event on the socket, when triggered will stop streaming the search results and remove it from the searches  object.
* 
* Line 66 : When a user disconnects, we don’t want any streams running in the background, so we will stop all the streams and delete the user instance from searches  object.
* 
* Line 77 : We start to listen on port 3000.
*/