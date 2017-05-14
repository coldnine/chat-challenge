var socket, name;

// Socket.io connection
$(document).ready(function () {
    // Socket.io
    socket = io();
    name = '';

    // Get nickname
    $('#nickname-set-button').click(function () {
        name = $('#nickname-input').val();

        if (!name)
            return;

        $('#dialog-wrapper').fadeOut(100);
        $('#nickname-dialog').fadeOut(100);
        $('#main-wrapper').fadeIn(100);

        socket.emit('set nickname', name);
    });

    // Send parent message
    $('#send-button').click(send_message);
    $('#send-input').on('keypress', function (e) {
        if (e.which === 13)
            send_message();
    });

    // Handle reply input
    $(document).on('keypress', '.reply-input', function (e) {
        if (e.which === 13) {
            var input = $(this);
            send_reply(input);
        }
    });

    // Socket event handlers

    // Announcement from server
    socket.on('announcement', function (message) {
        add_announcement(message);
    });

    // New user message sent
    socket.on('message', function (data) {
        data = JSON.parse(data);

        // Nickname & message
        var id = data['id'];
        var nickname = data['name'];
        var message = data['message'];

        // Get time
        var timestamp = data['timestamp'];

        // Add message to the messages container
        add_message(id, nickname, message, timestamp);
    });

    // New reply
    socket.on('reply', function (data) {
        // Parse JSON
        data = JSON.parse(data);

        // Nickname & message
        var id = data['id'];
        var nickname = data['name'];
        var message = data['message'];
        var timestamp = data['timestamp'];

        add_reply(id, nickname, message, timestamp);
    });

    // New user connected
    socket.on('user connected', function (username) {
        add_user(username);
    });

    // Old user disconnected
    socket.on('user disconnected', function (username) {
        remove_user(username);
    });
});

// Send parent message (question or other)
function send_message() {

    var send_input = $('#send-input');
    var message = send_input.val();

    if (!message)
        return;

    var data = {
        'message': message
    };

    socket.emit('message', JSON.stringify(data));

    send_input.val('');
    send_input.focus();
}

// Send reply message (answer or other)
function send_reply(input_element) {
    var id = input_element.attr('id').slice(12);
    var reply_message = input_element.val();

    if (!reply_message)
        return;

    var data = {
        'id': parseInt(id),
        'message': reply_message
    };

    socket.emit('reply', JSON.stringify(data));

    input_element.val('');
    input_element.focus();
}