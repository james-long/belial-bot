const Discord = require('discord.js');

// Processes unitInfo and chooses the right method based on how many results there are
exports.processResults = function(messageChannel, unitInfo){
    let numResults = unitInfo.units.length; // Number of results that were found in unitInfo
    console.log(numResults)
    if(numResults == 0){
        messageChannel.send("No units were found under those conditions.");
    }

    else if(numResults == 1){ // Reduce each one-element array of units and output
        for(let table in unitInfo){
            if(unitInfo.hasOwnProperty(table)){
                if(unitInfo[table].length == 0) {
                    unitInfo[table] = undefined;
                    // We define no info as undefined
                }
                else {
                    unitInfo[table] = unitInfo[table].reduce(() => {});
                    // Converts [info] to info (one-element reduction)
                }
            }
        }
        exports.sendUnitMessage(messageChannel, unitInfo);
    }

    else{ // Output only IDs and names so the user can further refine their search
        let message = "" + unitInfo["units"].length + " results found. Please use !unitid [number] on one " +
            "result or refine your search.\n" +
            "```\n";
        for(var i = 0; i < unitInfo["units"].length; i++){
            if(message.length > 1000){
                break;
            }
            message += ("" + unitInfo["units"][i]["UnitID"] + ": " + unitInfo["units"][i]["UnitName"] +
                " - " + unitInfo["units"][i]["UnitRarity"] + "*\n");
        }
        message += "```";
        if(i < unitInfo["units"].length)
        {
            message += "...and " + (unitInfo["units"].length - i + 1) + " more.";
        }
        messageChannel.send(message);
    }
}

// Sends an embed with unit info to the channel the message was called from.
// UnitInfo must be guaranteed to exist.
exports.sendUnitMessage = function(messageChannel, unitInfo){
    const embed = new Discord.RichEmbed()
        .setTitle(":star:".repeat(unitInfo.units.UnitRarity))
        .setAuthor(unitInfo.units.UnitName + " (ID " + unitInfo.units.UnitID + ")")
        .setColor(0x00AE86)
        .setDescription("Cost " + unitInfo.units.UnitCost + " | " + unitInfo.units.UnitElement +
            " | " + unitInfo.units.UnitTribe + " | " + unitInfo.units.UnitType)
        .setImage(unitInfo.units.UnitImageLink)
        .addField("Stats at Max Level (" + unitInfo.max_stats.MaxLevel + ") : " +
            "HP " + unitInfo.max_stats.HP + " | ATK " + unitInfo.max_stats.ATK + " | REC " + unitInfo.max_stats.REC,
            "Stats at Base Level (" + unitInfo.base_stats.BaseLevel + ") : " +
            "HP " + unitInfo.base_stats.HP + " | ATK " + unitInfo.base_stats.ATK + " | REC " + unitInfo.base_stats.REC)
        .addField("Skill: " + unitInfo.skills.SkillName,
            "Base Cooldown: " + unitInfo.skills.SkillBaseCD + " | Maxed Cooldown: " + unitInfo.skills.SkillFinalCD + "\n"
            + unitInfo.skills.SkillDescription)
        .addField("CSkill: " + unitInfo.cskills.CSkillName,
            unitInfo.cskills.CSkillDescription)
        .addField("Ability 1: " + unitInfo.ability_1.AbilityName,
            unitInfo.ability_1.AbilityDescription)
        .addField("Ability 2: " + unitInfo.ability_2.AbilityName,
            unitInfo.ability_2.AbilityDescription)
        .setTimestamp()
        .setFooter("This unit sells for " + unitInfo.units.UnitSellPrice + " Ghost Point(s)")
    messageChannel.send({embed});
}
