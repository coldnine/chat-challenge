// ElasticSearch
var elasticsearch = require('elasticsearch');

// Set bot name
const bot_name = 'K9';

// Random facts
const random_facts = [
    'Banging your head against a wall burns 150 calories an hour.',
    'In the UK, it is illegal to eat mince pies on Christmas Day!',
    'Pteronophobia is the fear of being tickled by feathers!',
    'When hippos are upset, their sweat turns red.',
    'A flock of crows is known as a murder.',
    '“Facebook Addiction Disorder” is a mental disorder identified by Psychologists.',
    'The average woman uses her height in lipstick every 5 years.',
    '29th May is officially “Put a Pillow on Your Fridge Day“.',
    'Cherophobia is the fear of fun.',
    'Human saliva has a boiling point three times that of regular water.',
    'If you lift a kangaroo’s tail off the ground it can’t hop.',
    'Bananas are curved because they grow towards the sun.',
    'Billy goats urinate on their own heads to smell more attractive to females.',
    'The person who invented the Frisbee was cremated and made into frisbees after he died!',
    'During your lifetime, you will produce enough saliva to fill two swimming pools.',
    'If Pinokio says “My Nose Will Grow Now”, it would cause a paradox.',
    'Polar bears can eat as many as 86 penguins in a single sitting. (If they lived in the same place)',
    'King Henry VIII slept with a gigantic axe beside him.',
    'Movie trailers were originally shown after the movie, which is why they were called “trailers”.',
    'An eagle can kill a young deer and fly away with it.',
    'Heart attacks are more likely to happen on a Monday.',
    'If you consistently fart for 6 years & 9 months, enough gas is produced to create the energy of an atomic bomb!',
    'in 2015, more people were killed from injuries caused by taking a selfie than by shark attacks.',
    'The top six foods that make your fart are beans, corn, bell peppers, cauliflower, cabbage and milk!',
    'There is a species of spider called the Hobo Spider.',
    'A lion’s roar can be heard from 5 miles away!',
    'A toaster uses almost half as much energy as a full-sized oven.',
    'A baby spider is called a spiderling.',
    'You cannot snore and dream at the same time.',
    'The following can be read forward and backwards: Do geese see God?',
    'A baby octopus is about the size of a flea when it is born.',
    'A sheep, a duck and a rooster were the first passengers in a hot air balloon.',
    'In Uganda, 50% of the population is under 15 years of age.',
    'Hitler’s mother considered abortion but the doctor persuaded her to keep the baby.',
    'Arab women can initiate a divorce if their husbands don’t pour coffee for them.',
    'Recycling one glass jar saves enough energy to watch TV for 3 hours.',
    'Smearing a small amount of dog feces on an insect bite will relieve the itching and swelling.',
    'Catfish are the only animals that naturally have an odd number of whiskers.',
    'Facebook, Skype and Twitter are all banned in China.',
    '95% of people text things they could never say in person.',
    'The Titanic was the first ship to use the SOS signal.',
    'In Poole, ‘Pound World’ went out of business because of a store across the road called ’99p Stores’, which was selling the same products but for just 1 pence cheaper! Read More.',
    'About 8,000 Americans are injured by musical instruments each year.',
    'The French language has seventeen different words for ‘surrender’.',
    'Nearly three percent of the ice in Antarctic glaciers is penguin urine.',
    'Bob Dylan’s real name is Robert Zimmerman.',
    'A crocodile can’t poke its tongue out :p',
    'Sea otters hold hands when they sleep so they don’t drift away from each other.',
    'A small child could swim through the veins of a blue whale.',
    'Bin Laden’s death was announced on 1st May 2011. Hitler’s death was announced on 1st May 1945.'
];

// Random dog GIFs
const dog_gifs = [
    'http://i.imgur.com/Z3rtFAT.gif',
    'http://i.imgur.com/3qV3pPZ.gif',
    'http://i.imgur.com/fQCsKr0.gif',
    'http://i.imgur.com/V4va1Sy.gif',
    'http://i.imgur.com/2Y4oZtj.gif',
    'http://i.imgur.com/c733DNU.gif',
    'http://i.imgur.com/U5vKX2u.gif',
    'http://i.imgur.com/zp6coEG.gif',
    'http://i.imgur.com/CLXxGA6.gif',
    'http://i.imgur.com/YZapNxk.gif',
    'http://i.imgur.com/VqDMxF3.gif',
    'http://i.imgur.com/4mMMYPF.gif',
    'http://i.imgur.com/YoabOVM.gif'
];

module.exports = function (io, message_history) {
    var module = {};

    // Export bot name
    module.bot_name = bot_name;

    // Initialize Elastic search
    var esclient = new elasticsearch.Client({
        host: 'localhost:9200'
    });

    // Delete if index exists already
    esclient.delete({
        index: 'chat',
        id: '1',
        type: 'messages'
    }, function (err, resp, status) {
    });

    // Create new index (chat/messages)
    esclient.index({
        index: 'chat',
        type: 'messages',
        body: {}
    }, function (err, resp, status) {
    });

    // Export ES client
    module.esclient = esclient;

    // Handle new user (send a nice message)
    module.handle_new_user = function (username) {
        send_message('Welcome ' + username + ' to ChattyChat!');
        send_reply(message_history.length - 1, '<a target="_blank" href="' + dog_gifs[Math.floor(Math.random() * dog_gifs.length)] + '">here is a random cute dog GIF.</a>')
    };

    // Function handle new message
    module.handle_message = function (id, name, message, timestamp) {
        message = message.toLowerCase();
        var reply_message;

        if (message === 'xkcd') {
            // Return XKCD random comics
            reply_message = '<a target="_blank" href="https://c.xkcd.com/random/comic/">Here is a good one.</a>';

        } else if (message === 'random fact') {
            // Random fact
            reply_message = 'You want a random fact? very well then - <b>' + random_facts[Math.floor(Math.random() * random_facts.length)] + '</b>';

        } else if (message[message.length - 1] === '?') {
            // Use elastic search to handle same questions which were asked differently
            esclient.search({
                'index': 'chat',
                'type': 'messages',
                'body': {
                    'query': {
                        'match': {'message': message}
                    }
                }
            }, function (error, response, status) {
                if (error) {
                    console.log("Search error: " + error)
                } else {
                    for (var i = 0; i < response.hits.hits.length; i++) {
                        var hit = response.hits.hits[i];

                        if (message_history[hit['_source']['id']]['replies'].length > 0 &&
                            message_history[hit['_source']['id']]['replies'][0]['name'] !== bot_name) {

                            var original_name = message_history[hit['_source']['id']]['replies'][0]['name'];
                            reply_message = message_history[hit['_source']['id']]['replies'][0]['message'];
                            reply_message = 'This question might have been answered by "<i>' + original_name + '</i>": "<i>' + reply_message + '</i>"';

                            send_reply(id, reply_message);

                            break;
                        }
                    }
                }
            });

            return;
        } else {
            return;
        }

        // Echo to all
        send_reply(id, reply_message);
    };

    // Send reply from bot to all listening, and add to message history
    function send_message(message) {
        // Parse message with JSON
        data = {
            'id': message_history.length,
            'name': bot_name,
            'message': message,
            'timestamp': Date.now(),
            'replies': []
        };

        // Broadcast message
        io.emit('message', JSON.stringify(data));

        // Push new data to message_history
        message_history.push(data);

    }

    // Send reply from bot to all listening, and add to message history
    function send_reply(id, message) {
        var data = {
            'id': id,
            'name': bot_name,
            'message': message,
            'timestamp': Date.now()
        };

        io.emit('reply', JSON.stringify(data));

        delete data['id'];

        message_history[+id]['replies'].push(data);
    }

    return module;
};

