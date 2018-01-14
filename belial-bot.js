const Discord = require('discord.js');
const auth = require('./auth.json');
const Messenger = require('./messenger.js');
const SQLQuery = require('./sqlquery.js');
const QueryBuilder = require('./querybuilder.js');

SQLQuery.verifyConnection();

// New instance of Discord client
const bot = new Discord.Client();

// Use bot token to attempt login
bot.login(auth.token).catch(err => console.log("There was an error in login: " + err));

// Event occurring when the bot is connected
bot.on("ready", () => console.log("Successfully connected to Discord."));

// Event occurring when the bot detects a message
bot.on('message', message => {
    // Avoid self-replies
    if (message.author.bot) return;

    // Only trigger on "!"
    if (message.content.indexOf('!') === 0) {
        // Retrieve message without "!" and splits it into words
        let rawtext = message.content.substring(1);
        rawtext = rawtext.replace(/\s+/g," ").trim(); // Remove duplicate spaces
        rawtext = rawtext.split(" ");

        let command = rawtext.shift(); // The first value is the command
        let data = rawtext.join(" ");

        if(command === "unitid") { // Query by unit ID
            SQLQuery.getUnitByID(data) // We output immediately once an ID is found
                .then(result => Messenger.processResults(message.channel, result))
                .catch(err => console.log(err));
        }
        else if(command === "unitname") { //Supply the IN condition for UnitID
            SQLQuery.getUnitByQuery(" WHERE UnitID IN " +
                "(SELECT UnitID FROM units WHERE UnitName LIKE \"%" + data + "%\")")
                .then(result => Messenger.processResults(message.channel, result))
                .catch(err => console.log(err));
        }
        else if(command === "startquery") { // Helps the user construct an SQL query
            let allRestrictions = [];
            QueryBuilder.startGeneralCollector(message, allRestrictions);
        }
    }
});