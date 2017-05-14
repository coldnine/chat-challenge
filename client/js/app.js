// App
var online_users = [], message_history = [];

$(function () {
    // Get online user-names
    $.get('/online_users', function (users) {
        online_users = users;
        refresh_user_list();
    });

    // Get message history
    $.get('/message_history', function (messages) {
        message_history = messages;
        refresh_message_history();
        refresh_reply_history();
    });
});

// Add online username (new user has joined the chat room)
function add_user(username) {
    online_users.push(username);
    refresh_user_list();
}

// Remove username from online-users list (user has left the chat room)
function remove_user(username) {
    var index = online_users.indexOf(username);
    if (index > -1) {
        online_users.splice(index, 1);
        refresh_user_list();
    }
}

// Refresh the user list (UI)
function refresh_message_history() {
    var i;

    // Get 'ul'
    var message_list = $('#messages-container');
    message_list.html('');

    // Add all users to list
    for (i = 0; i < message_history.length; i++) {
        var data = message_history[i];

        var id = data['id'];
        var nickname = data['name'];
        var message = data['message'];
        var timestamp = data['timestamp'];

        // Append message to list
        add_message(id, nickname, message, timestamp);
    }
}

// Add message to list (UI)
function add_message(id, nickname, message, timestamp) {
    var message_list = $('#messages-container');
    var formatted_time = format_timestamp(timestamp);

    // Append message to list
    message_list.append(' <li>\
        <div class="collapsible-header">\
        <span class="badge timestamp" data-badge-caption="' + formatted_time + '"></span>\
            <span class="new badge" id="replies-badge-' + id + '" style="display: none;" data-badge-caption="replies">0</span>\
            <span class="blue-text"><b>' + nickname + '</b></span>: ' + message + '\
        </div>\
        <div class="collapsible-body">\
            <div class="replies collection" id="replies-list-' + id + '">\
            </div>\
            <div class="reply-input-wrapper row">\
                <input type="text" class="col s12 validate reply-input" placeholder="Write a reply..." id="reply-input-' + id + '">\
            </div>\
        </div>\
    </li>');
}

// Add reply to message (by ID, name, message) (UI)
function add_reply(id, nickname, message, timestamp) {
    // Get time
    var formatted_time = format_timestamp(timestamp);

    // Add to replies
    var replies_list = $('#replies-list-' + id);
    replies_list.append('<div class="collection-item reply">\
            <span class="blue-text"><b>' + nickname + '</b></span>: ' + message + '\
            <span class="badge timestamp reply-timestamp">' + formatted_time + '</span>\
        </div>');

    // Change replies caption
    var replies_count = replies_list.children().length;
    var badge = $('#replies-badge-' + id);

    if (badge.css('display') === 'none')
        badge.show('slow');

    if (replies_count === 1)
        badge.attr('data-badge-caption', 'reply');
    else
        badge.attr('data-badge-caption', 'replies');

    badge.html(replies_count.toString());
}

// Add announcement to list (UI)
function add_announcement(message) {
    $('#messages-container').append('<li class="message">\
            <div class="collapsible-header">\
                <span class="red-text"><b>' + message + '</b></span>\
            </div>\
        </li>');
}


// Refresh the user list (UI)
function refresh_reply_history() {
    var i;

    // For each message
    for (i = 0; i < message_history.length; i++) {
        var j, id = message_history[i]['id'];

        // For each reply inside message
        for (j = 0; j < message_history[i]['replies'].length; j++) {
            var data = message_history[i]['replies'][j];

            var nickname = data['name'];
            var message = data['message'];
            var timestamp = data['timestamp'];

            // Add reply to message's reply list
            add_reply(id, nickname, message, timestamp);
        }
    }
}

// Refresh the user list (UI)
function refresh_user_list() {
    var i;

    // Get 'ul'
    var user_list = $('#online-users-list');

    // Clear list
    var list_childern = user_list.children().slice(1);
    for (i = 0; i < list_childern.length; i++)
        list_childern[i].remove();

    // Add all users to list
    for (i = 0; i < online_users.length; i++)
        user_list.append('<li class="collection-item"><div class="valign-wrapper"><i class="green-text tiny material-icons">stop</i>' + online_users[i] + '</div></li>');
}

// Format timestmap
function format_timestamp(timestamp) {
    // Get time
    timestamp = new Date(timestamp);
    var hours = String('00' + timestamp.getHours()).slice(-2);
    var minutes = String('00' + timestamp.getMinutes()).slice(-2);
    return hours + ':' + minutes;
}
