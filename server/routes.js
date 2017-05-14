var messages = require('./messages');
var online_users = require('./online_users').online_users;

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.sendfile('./client/index.html');
    });

    app.get('/message_history', function (req, res) {
        res.json(messages.message_history);
    });

    app.get('/online_users', function (req, res) {
        res.json(online_users);
    });
};
