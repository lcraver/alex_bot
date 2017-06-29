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
        runtime.express.listen(8000, function () {
            console.log('Alex Bot listening on port 8000');
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
        ChatBot.FindResponse(tags, function(response){
            ChatBot.AddToLog(req.body.token, "user", req.body.message);
            ChatBot.AddToLog(req.body.token, "alex", response);
            dataformatter.SendResponse("Chat Used: " + req.body.message, {response: response, tags: tags}, res);
        });
    };

    static CreateChatSession(req, res) {
        console.log("/chat/new - Chat Session Created");
        let greetings = runtime.settings.greetings;

        let token = randomStringAsBase64Url(64);
        let greeting = greetings.random();
        ChatBot.CreateSessionInfo(token, greeting);

        dataformatter.SendResponse("Chat Session Created", {token: token, response: greetings.random()}, res);
    }

    static CreateSessionInfo(token, greeting)
    {
        let sessionTmp = {
            user: "",
            context: {

            },
            log: []
        }

        runtime.db.users.currentsessions[token] = sessionTmp;

        ChatBot.AddToLog(token, "alex", greeting);
    }

    static UpdateSessionInfo(token, context)
    {
        runtime.db.users.currentsessions[token].context.push(context);
    }

    static AddToLog(token, user, message) {

        runtime.settings.banned_words.forEach(function(word) {

            let lowercaseMessage = message.toLowerCase();
            let index = lowercaseMessage.indexOf(word.toLowerCase());

            if(index != -1) {
                console.log("FOUND BAD");
                for(let i = 0; i < word.length; i++)
                    message = message.replaceAt(index+i, "*");
            }
        });

        let tmpMessage = {
            user: user,
            message: message,
            time: new Date()
        }

        runtime.db.users.currentsessions[token].log.push(tmpMessage);
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
        message = message.replace("century link", 'centurylink');
        message = message.replace("level 3", 'level3');
        
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

    static FindResponse(tags, callback) {

        let currentObj = runtime.db.bot.patterns;
        let newTags = tags;

        //make recurrsive

        /*tags.forEach(function(tag) {
            if(currentObj != undefined && currentObj != null) {
                if(currentObj.hasOwnProperty(tag))
                    currentObj = currentObj[tag];
                else
                {
                    console.log("DEFAULT");
                    if(currentObj.hasOwnProperty("default"))
                        currentObj = currentObj["default"];
                }

                console.log(currentObj);
            }
        });*/

        while(tags.length != 0) {
            let tag = newTags[0];

            if(currentObj.hasOwnProperty(tag))
                currentObj = currentObj[tag];

            newTags.splice(0,1);

            console.log("tags:" + JSON.stringify(newTags));
            console.log("obj:" + JSON.stringify(currentObj));

            if(newTags.length == 0)
            {
                if(currentObj.hasOwnProperty("default"))
                    return callback(currentObj["default"]);
                else
                    return callback(currentObj);
            }
        }

        return callback(runtime.db.bot.patterns["default"]);
    }
}

module.exports = ChatBot;