const Discord = require('discord.js');
const Database = require('./dbinfo.js');
const Messenger = require('./messenger.js');
const SQLQuery = require('./sqlquery.js');

exports.startGeneralCollector = function(message, collectedInfo){
    console.log(collectedInfo);
    let restrictionString;
    if(collectedInfo.length > 0)
    {
        restrictionString = "```\n";
        collectedInfo.forEach(val => {
            restrictionString += (val.Outer + " : " + val.Inner + " - " + val.Restriction + "\n");
        });
        restrictionString += "```";
        console.log(restrictionString);
    }
    message.channel.send("Preparing search query.\n" +
        "The current restrictions are:\n" +
        (restrictionString || "```NO RESTRICTIONS```") +
        "\nType in one of the following commands:\n" +
        "**add** - to add a restriction to the search\n" +
        "**remove** - to remove a restriction\n" +
        "**search** - to search with current restrictions");

    let collector = new Discord.MessageCollector(message.channel, msg => {
        return msg.author.id === message.author.id;
    }, { time : 10000 });

    collector.on('collect', message => {
        if(message.content === "add") {
            collector.stop("add");
        }
        else if(message.content === "remove") {
            if(collectedInfo.length == 0){
                message.channel.send("No conditions to remove!");
            }
            else{
                collector.stop("remove");
            }
        }
        else if(message.content === "search") {
            // Helper function to parse the given condition into SQL
            function parseCond(cmd){
                console.log(cmd.indexOf("GREATER THAN"));
                let toReturn = "";
                ["EXACT MATCH", "ENDS WITH", "STARTS WITH", "CONTAINS"].forEach((val, ind) => {
                    if(cmd.indexOf(val) === 0) {
                        // cmd is a string
                        toReturn = [" = \"Q\"", " LIKE \"%Q\"", " LIKE \"Q%\"", " LIKE \"%Q%\""][ind]
                            .replace("Q", cmd.substring(val.length).trim());
                    }
                });
                ["GREATER THAN", "LESS THAN", "EQUAL TO"].forEach((val, ind) => {
                    if(cmd.indexOf(val) === 0) {
                        // cmd is a number
                        toReturn = [" > Q", " < Q", " = Q"][ind]
                            .replace("Q", cmd.substring(val.length).trim());
                    }
                });
                return toReturn;
            }

            // Form a query from the data that we have
            let query = "";
            if(collectedInfo.length > 0){
                query += " WHERE ";
                while(collectedInfo.length > 1){
                    let data = collectedInfo.shift();
                    query += "UnitID IN (SELECT UnitID FROM " + data.Outer + " WHERE " + data.Inner +
                        parseCond(data.Restriction) + ") AND ";
                }
                let final = collectedInfo.shift();
                query += "UnitID IN (SELECT UnitID FROM " + final.Outer + " WHERE " + final.Inner +
                    parseCond(final.Restriction) + ")";
            }
            console.log(query);
            SQLQuery.getUnitByQuery(query)
                .then(result => Messenger.processResults(message.channel, result))
                .catch(err => console.log(err));
            collector.stop("search");
            // Search here, pass the finished query to end
        }
    });

    collector.on('end', (collected, reason) => {
        console.log("Collection period for General collector ended.");
        if(reason === "add"){
            //proceed onto add sequence
            startOuterAddCollector(message, collectedInfo);
        }
        if(reason === "remove"){
            startRemoveCollector(message, collectedInfo);
        }
        if(reason === "search"){
            //proceed onto search sequence
        }
    });
}

function startRemoveCollector(message, collectedInfo){
    let restrictionString = "```\n";
    collectedInfo.forEach((val, ind) => {
        restrictionString += ("" + ind + ") " + val.Outer + " : "
            + val.Inner + " - " + val.Restriction + "\n");
    });
    restrictionString += "```";

    let currentMessage = message.channel.send("Which restriction would you like to remove?" +
        restrictionString);
    let collector = new Discord.MessageCollector(message.channel, msg => {
        return msg.author.id === message.author.id;
    }, { time : 10000 });

    collector.on('collect', message => {
        if(!isNaN(message.content) &&
            +message.content >= 0 &&
            +message.content <= collectedInfo.length) {
            // If the input is a valid number within the table
            collectedInfo.splice(+message.content, 1);
            collector.stop("complete")
        }
        else if(message.content === "cancel") {
            collector.stop("cancel");
            // Return to original
        }
    });

    collector.on('end', (collected, status) => {
        currentMessage.then(msg => {return msg.delete();}).catch(err => console.log(err));
        startGeneralCollector(message, collectedInfo);
    });
}

function startOuterAddCollector(message, collectedInfo){
    let currentMessage = message.channel.send("Creating new restriction.\n" +
        "Which table would you like to create the restriction in?" +
        "```\n" +
        "0 - General Unit Data (stats, etc.)\n" +
        "1 - Unit Base Stats\n" +
        "2 - Unit Max Stats\n" +
        "3 - Unit Skills\n" +
        "4 - Unit Crash Skills\n" +
        "5 - Unit Ability 1\n" +
        "6 - Unit Ability 2\n" +
        "7 - Unit Ability 3\n" +
        "8 - Unit Ability 4\n" +
        "9 - Unit Ability 5```");

    let collector = new Discord.MessageCollector(message.channel, msg => {
        return msg.author.id === message.author.id;
    }, { time : 10000 });

    collector.on('collect', message => {
        if(!isNaN(message.content) &&
            +message.content >= 0 &&
            +message.content <= Object.keys(Database).length) { // If the input is a valid number
            collector.stop(Object.keys(Database)[+message.content]);
        }
        else if(message.content === "cancel") {
            collector.stop("cancel");
            // Return to original
        }
    });

    collector.on('end', (collected, outerDB) => {
        currentMessage.then(msg => {return msg.delete();}).catch(err => console.log(err));
        console.log("Collection period for Outer collector ended.");
        if(Database.hasOwnProperty(outerDB)){ //If the input is valid
            message.channel.send("Proceeding onto second-level add.");
            startInnerAddCollector(message,collectedInfo, outerDB);
        }
        else if(outerDB === "cancel" || outerDB === "time"){
            //proceed onto search sequence
            message.channel.send("Returning back to general collector.");
            startGeneralCollector(message, collectedInfo);
        }
    });
}

function startInnerAddCollector(message, collectedInfo, outer){
    let possibilities = "```\n";
    Object.keys(Database[outer]).forEach((val, index) => {
        possibilities += ("" + index + " - " + val + "\n");
    })
    possibilities += "```";

    let currentMessage = message.channel.send("Creating new restriction.\n" +
        "Which field of " + outer + " would you like to create the restriction in?" +
        possibilities);
    let collector = new Discord.MessageCollector(message.channel, msg => {
        return msg.author.id === message.author.id;
    }, { time : 10000 });

    collector.on('collect', message => {
        if(!isNaN(message.content) &&
            +message.content >= 0 &&
            +message.content <= Object.keys(Database[outer]).length) {
            // If the input is a valid number within the table
            collector.stop(Object.keys(Database[outer])[+message.content]);
        }
        else if(message.content === "cancel") {
            collector.stop("cancel");
            // Return to original
        }
    });

    collector.on('end', (collected, innerDB) => {
        currentMessage.then(msg => {return msg.delete();}).catch(err => console.log(err));
        console.log("Collection period for Inner collector ended.");
        if(Database[outer].hasOwnProperty(innerDB)){ //If the input is valid within the table
            message.channel.send("Proceeding onto third-level add.");
            startFinalAddCollector(message, collectedInfo, outer, innerDB);
        }
        else if(innerDB === "cancel" || innerDB === "time"){
            // Proceed onto search sequence
            message.channel.send("Returning back to general collector.");
            startGeneralCollector(message, collectedInfo);
        }
    });
}

function startFinalAddCollector(message,collectedInfo, outer, inner) {
    let possibilities = "```\n";
    if (typeof Database[outer][inner] === "string") {
        possibilities += "EXACT MATCH [text]\n" +
            "STARTS WITH [text]\n" +
            "ENDS WITH [text]\n" +
            "CONTAINS [text]";
    }
    else {
        possibilities += "GREATER THAN [number]\n" +
            "LESS THAN [number]\n" +
            "EQUAL TO [number]";
    }
    possibilities += "```";

    let currentMessage = message.channel.send("Creating new restriction.\n" +
        "Which restriction would you like to impose on **" + outer + " : " + inner + "**?\n" +
        "This field is a " + (typeof Database[outer][inner] === "string" ? "word" : "number") + "," +
        " so your restrictions must be one of the following:\n" + possibilities);
    let collector = new Discord.MessageCollector(message.channel, msg => {
        return msg.author.id === message.author.id;
    }, {time: 10000});

    collector.on('collect', message => {
        if (message.content === "cancel") {
            collector.stop("cancel");
            // Return to original
        }
        else if (typeof Database[outer][inner] === "string") {
            let cmd = message.content.trim();
            ["EXACT MATCH", "ENDS WITH", "STARTS WITH", "CONTAINS"].forEach(val => {
                if (cmd.indexOf(val) == 0) {
                    collector.stop(cmd);
                }
            });
        }
        else if (typeof Database[outer][inner] === "number") {
            let cmd = message.content.trim();
            ["GREATER THAN", "LESS THAN", "EQUAL TO"].forEach(val => {
                if (cmd.indexOf(val) == 0) {
                    if (!isNaN(cmd.substring(val.length).trim())) { // Ensure the query is a number
                        collector.stop(cmd);
                    }
                }
            });
        }
    });

    collector.on('end', (collected, restriction) => {
        currentMessage.then(msg => {
            return msg.delete();
        }).catch(err => console.log(err));
        console.log("Collection period for Inner collector ended.");
        if (restriction != "cancel" && restriction != "time") {
            collectedInfo.push({"Outer": outer, "Inner": inner, "Restriction": restriction});
            startGeneralCollector(message, collectedInfo);
        }
        if (restriction === "cancel" || restriction === "time") {
            //proceed onto search sequence
            message.channel.send("Returning back to general collector.");
            startGeneralCollector(message, collectedInfo);
        }
    });
}