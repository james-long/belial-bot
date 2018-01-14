# belial-bot
Node.js Discord bot that helps users make queries to a MySQL database of Crash Fever units. 

## What is this for?
Crash Fever is a popular mobile game for iOS and Android. Check out Crash Fever on the [iOS App Store](https://itunes.apple.com/ca/app/crash-fever/id1146722894) and [Google Play](https://play.google.com/store/apps/details?id=com.wonderplanet.CrashFever)!

This project is a Discord unit lookup bot written in Node.js. It has access to a MySQL database of information on Crash Fever units, such as their rarity, base and max stats, skill descriptions, etc.

Belial Bot is currently a work in progress, and has a few unchecked cases left to cover and features to implement before he will be ready for public use.

## Usage
To initialize the bot, you will need to create a MySQL database with the relevant data. 

In the `init` folder, there are three scripts you should modify with the relevant credentials and then run in the order `initdb-cf-units.sql` > `wikiScrape.py` > `accessDB.py`. This will create the database and fill it with data.

After, you will need to connect the bot to the relevant database. This can be done by modifying the `authtemplate.json` file and renaming to `auth.json`.

After that, running the included batch file `run-belial-bot.bat` should be enough to get the bot up and running!

## Commands
`!unitid <id>` - Searches for units with ID equal to `id` and brings up an embed of general information about the unit, if available.

`!unitname <name>` - Searches for units with names containing `name` and brings up an embed of general information about the unit, if available.

`!startquery` - Starts an interactive query builder that allows users to traverse the database and set up restrictions to perform a refined search with.

## Screenshots
![unitname command](screenshots/unitname.png)
![unitid and startquery commands](screenshots/12.png)

## Dependencies
Belial Bot has dependencies on `discord.js` and `mysql`. It also uses `mysql-promise` to perform Promise-based async calls to the database.

Furthermore, Belial Bot currently scrapes unit information from the unofficial [Crash Fever Wiki](https://cf-wiki.info/). It is stored in a database with structure shown in `dbReference.json`.
