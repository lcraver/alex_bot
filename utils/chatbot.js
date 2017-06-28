'use strict';

let runtime = require('./runtime');
const dataformatter = require('./dataformatter');
var base64url = require('base64url');
let crypto = require('crypto');

/** Sync */
function randomStringAsBase64Url(size) {
  return base64url(crypto.randomBytes(size));
}

class ChatBot {
	static Start() {
        runtime.express.listen(3000, function () {
            console.log('Alex Bot listening on port 3000');
        });

        // Sends user chat message and sends back the bot's response.
        runtime.express.post('/chat', function(req, res) {
            ChatBot.HandleChat(req, res);
        });

        // Sends user chat message and sends back the bot's response.
        runtime.express.delete('/chat', function(req, res) {
            ChatBot.DestroyChatSession(req, res);
        });

        // Inits a new chat session with a user.
        runtime.express.post('/chat/new', function(req, res) {
            ChatBot.CreateChatSession(req, res);
        });

        // Sends user chat message and sends back the bot's response.
        runtime.express.get('/sessions', function(req, res) {
            dataformatter.SendResponse("Sessions Debug", {sessions: runtime.db.users.currentsessions}, res);
        });

        // Sends user chat message and sends back the bot's response.
        runtime.express.get('/tags', function(req, res) {
            dataformatter.SendResponse("Tags Debug", {tags: runtime.db.bot.tags}, res);
        });
	};

    static HandleChat(req, res) {
        console.log("/chat - Chat Used");
        console.log(req.body);

        let tags = ChatBot.FindTags(req.body.message);
        let message = "";

        if(tags.length == 0)
        {
            dataformatter.SendResponse("Chat Used: " + req.body.message, {response: "I'm sorry I don't understand. Please re-ask the question."}, res);
        }
        else
        {
            dataformatter.SendResponse("Chat Used: " + req.body.message, {response: tags}, res);
        }
    };

    static CreateChatSession(req, res) {
        console.log("/chat/new - Chat Session Created");
        let greetings = runtime.settings.greetings;

        let token = randomStringAsBase64Url(64);
        ChatBot.CreateSessionInfo(token);
        dataformatter.SendResponse("Chat Session Created", {token: token, response: greetings.random()}, res);
    }

    static CreateSessionInfo(token)
    {
        let sessionTmp = {
            user: "",
            context: {

            }
        }

        runtime.db.users.currentsessions[token] = sessionTmp;
    }

    static UpdateSessionInfo(token, context)
    {
        runtime.db.users.currentsessions[token].context.push(context);
    }

    static DestroyChatSession(req, res) {
        if(req.body.token != null && req.body.token != "") {
            console.log("/chat - Destroy Chat Session: " + req.body.token);
            delete runtime.db.users.currentsessions[req.body.token];
        }
    }

    static FindTags(message) {
        let re = /[\?]/g;
        let re2 = /[\!]/g;
        message = message.toLowerCase();
        message = message.replace(re, ' ?');
        message = message.replace(re2, ' !');
        
        let messageWords = message.split(" ");
        let tags = [];

        console.log("Words:" + JSON.stringify(messageWords));

        messageWords.forEach(function(word) {
            if(runtime.db.bot.tags.hasOwnProperty(word))
                tags.push(runtime.db.bot.tags[word]);
        });

        console.log("Tags:" + JSON.stringify(tags));

        return tags;
    }
}

module.exports = ChatBot;