var online_users = require('./online_users').online_users;

module.exports = {
    last_id: 0,

    // Message history (list of dict s)
    message_history: [{
            'id': 0,
            'name': 'Server',
            'message': 'Welcome! don\'t forget to have lots of fun!',
            'timestamp': Date.now(),
            'replies': []
    }]
};