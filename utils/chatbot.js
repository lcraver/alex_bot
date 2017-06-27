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

        // Inits a new chat session with a user.
        runtime.express.post('/chat/new', function(req, res) {
            ChatBot.CreateChatSession(req, res);
        });

        // Sends user chat message and sends back the bot's response.
        runtime.express.get('/sessions', function(req, res) {
            dataformatter.SendResponse("Sessions Debug", {sessions: runtime.db.users.currentsessions}, res);
        });
	};

    static HandleChat(req, res) {
        console.log("/chat - Chat Used");
        console.log(req);
        dataformatter.SendResponse("Chat Used: " + req.body.message, {}, res);
    };

    static CreateChatSession(req, res) {
        console.log("/chat/new - Chat Session Created");
        let greetings = runtime.settings.greetings;

        let token = randomStringAsBase64Url(64);
        runtime.db.users.currentsessions.push(token);
        dataformatter.SendResponse("Chat Session Created", {token: token, response: greetings.random()}, res);
    }
}

module.exports = ChatBot;