const express = require('express');
const app = express();
const chatbot = require('./utils/chatbot');
const bodyParser = require('body-parser');
require('./utils/prototypes');
var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

// Setup Runtime
let runtime = require('./utils/runtime');
runtime.debug = process.argv[2] === 'debug' || false;
runtime.startup_time = new Date().getTime();
runtime.settings = require('./settings/main');
runtime.express = app;
runtime.version = require('./package').version;
runtime.db.users.currentsessions = require('./db/users/currentsessions');
runtime.db.bot.tags = require('./db/bot/tags');
runtime.db.bot.patterns = require('./db/bot/patterns');
runtime.fs = fs;

console.log(runtime);

chatbot.Start();