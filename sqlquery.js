const auth = require('./auth.json');
const MySQL = require('mysql-promise')(); // Promise-based wrapper for mysql module

// Configure database connection through auth.json
MySQL.configure({
    host     : auth.mysqlHost,
    user     : auth.mysqlUser,
    password : auth.mysqlPass,
    database : auth.mysqlDB
});

// Test connection to cf_units database
exports.verifyConnection = function(){
    MySQL.query("SELECT * FROM units WHERE UnitID = " + Math.ceil(Math.random()*900))
        .then(result => console.log("Successfully connected to MySQL and queried a " + result[0][0].UnitName))
        .catch(err => console.log("There was an error in connecting to the database: " + err));
}

// Queries based on a user-given query and returns data on a set of units
// In this case, the user must give a query taht results in a list of UnitIDs
exports.getUnitByQuery = function(query = ""){
    allUnitInfo = {};
    let allQueries = []; // Array of Promises to resolve
    let allTables = ["units", "base_stats", "max_stats", "skills", "cskills",
        "ability_1", "ability_2", "ability_3", "ability_4", "ability_5"];
    allTables.forEach(table => allQueries.push(MySQL.query("SELECT * FROM " + table +
        query + ";")
        .catch(err => console.log(err))));
    return Promise.all(allQueries) // This promise only completes when all queries return
        .then(result => {
            for(let i = 0; i < allTables.length; i++){
                allUnitInfo[allTables[i]] = [];
                for(let j = 0; j < result[i][0].length; j++)
                    allUnitInfo[allTables[i]].push(result[i][0][j]); // Working with the weird return format of mysql
            }
            return allUnitInfo;
        })
        .catch(err => console.log(err));
}

// Queries based on unit ID and returns all data about a single unit
exports.getUnitByID = function(unitID){
    let allUnitInfo = {};
    let allQueries = []; // Array of Promises to resolve
    let allTables = ["units", "base_stats", "max_stats", "skills", "cskills",
        "ability_1", "ability_2", "ability_3", "ability_4", "ability_5"];
    allTables.forEach(table => allQueries.push(MySQL.query("SELECT * FROM " + table + " WHERE UnitID = " + unitID +";")
        .catch(err => console.log(err))));

    return Promise.all(allQueries) // This promise only completes when all queries return
        .then(result => {
            for(let i = 0; i < allTables.length; i++){
                allUnitInfo[allTables[i]] = [];
                for(let j = 0; j < result[i][0].length; j++)
                    allUnitInfo[allTables[i]].push(result[i][0][j]); // Working with the weird return format of mysql
            }
            return allUnitInfo;
        })
        .catch(err => console.log(err));
}