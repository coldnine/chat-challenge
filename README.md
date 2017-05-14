# Chat Challenge
A chat server and client (JS based) - including a chat bot.

### Requirements
- Node.js 
- Express
- HTTP
- Elasticsearch

### Client libraries used
- jQuery 
- socket.io
- Materialize (CSS)

### Installation
Simply clone the repository to your hard drive:

    $ git clone https://github.com/coldnine/chat-challenge

### Use
Execute elasticsearch ('localhost': 9200), and execute the main JS file using JSON:
    
    $ node app.js

### Chat bot commands & features
!["K9 robot"](http://img.auctiva.com/imgdata/3/4/3/8/7/2/webimg/411590887_o.jpg)

Since the chat is Q&A based, using elasticsearch the server determines whether a question had been asked before, 
and posts a posted answer.

Commands:
- xkcd: Posts a link to random _xkcd_ comics
- random fact: Posts a random fact

### Single Message JSON Structure
Each message contains the following:
- ID of the message
- Sender name
- Message content
- Timestamp of the message
- List of messsage replies

A "parent" question also contains a list of replies.

    [
        ...
            
        {
            "id": id_number
            "name": "sender_name",
            "message": "message_content",
            "timestamp": time-stamp,
            "replies": [
                {
                    "name": "replier_name",
                    "message": "reply_content",
                    "timestamp": time-stamp
                },
                
                ...
            ]
        },
        
        ...
    ]