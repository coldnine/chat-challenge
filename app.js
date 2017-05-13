// HTTP, EXPRESS, SOCKET.IO
var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);
var port  	 = 8081;

// Static web-page
app.use(express.static(__dirname + '/client'));

// Add routes
require('./server/routes.js')(app);

// CHAT BOT, MESSAGES, UTILITIES
// Handle online users
var users           = require('./server/online_users').online_users;

// Handle message history
var last_id         = require('./server/messages').last_id;
var message_history = require('./server/messages').message_history;

// Chat bot
var chat_bot        = require('./server/chat_bot')(io, message_history);

// UTILITIES
var utilities       = require('./server/utilities')();

// Attach socket-id to nickname
var socket_username = {};

// Handle socket.io connections
io.on('connection', function(socket) {
    // New message received
    socket.on('message', function(data){
        // Get user name
        var username = socket_username[socket.id];

        // Check if user has set his name
        if(!username)
            return;

        // Parse message with JSON
        data = JSON.parse(data);

        // Add timestamp, replies and ID
        data['id'] = (++last_id);
        data['timestamp'] = Date.now();
        data['replies'] = [];

        // HTML escape
        data['name'] = username;
        data['message'] = utilities.escape_html(data['message']);

        // Broadcast message
        io.emit('message', JSON.stringify(data));

        // Push new data to message_history
        message_history.push(data);

        // Chat bot handle
        chat_bot.handle_message(data['id'], data['name'], data['message'], data['timestamp']);

        console.log('MESSAGE \'' + data['name'] + '\':\'' + data['message'] + '\'');
    });

    socket.on('reply', function(data){
        // Get user name
        var username = socket_username[socket.id];

        // Check if user has set his name
        if(!username)
            return;

        // Parse message with JSON
        data = JSON.parse(data);

        // Get id
        var id = +data['id'];

        // HTML escape
        data['name'] = username;
        data['message'] = utilities.escape_html(data['message']);

        // Add timestamp, replies and ID
        data['timestamp'] = Date.now();

        // Broadcast message
        io.emit('reply', JSON.stringify(data));

        // Push to ES database
        if(message_history[id]['replies'].length === 0) {
            chat_bot.esclient.bulk({
                body: [{ index:  { _index: 'chat', _type: 'messages', _id: 1 } }, message_history[id]]
            }, function (err, resp) { });
        }

        // Push new data to message_history
        message_history[id]['replies'].push(data);

        console.log('REPLY \'' + data['name'] + '\':\'' + data['message'] + '\'');
    });

    // User sets new nickname
    socket.on('set nickname', function(name){
        // Add to online users array, escape HTML
        name = utilities.escape_html(name);
        socket_username[socket.id] = name;
        users.push(name);

        // Announce "new user joined" message
        io.emit('user connected', name);
        io.emit('announcement', socket_username[socket.id] + ' has joined the chat room.');

        // Tell chat bot to handle new user
        chat_bot.handle_new_user(name);
        last_id++;

        console.log('JOIN ' + socket_username[socket.id]);
    });

    // User disconnected
    socket.on('disconnect', function() {
        // Get name from socket
        var name = socket_username[socket.id];

        // Delete name from arrays and dict s
        if(socket.id in socket_username) {
            var index = users.indexOf(name);

            if (index > -1)
                users.splice(users.indexOf(name), 1);

            delete socket_username[socket.id];

            // Announce "user has left" message
            io.emit('user disconnected', name);
            io.emit('announcement', name + ' has left the chat room.');

            console.log('LEFT ' + name);
        }
    });
});

// HTTP listen to 'port'
http.listen(port, function() {
    console.log("Web server listening on port " + port);
});