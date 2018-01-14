import MySQLdb
import os

# This script takes the unitData folder that results from running wikiScrape.py and moves the info within into a MySQL DB.
# This script isn't very maintainable and involves a lot of hard coding (ie. it works, but any update will probably break it).
# This was done in order to allocate more time to bot development, and web scraping will likely be done in Node for future updates.

db = MySQLdb.connect(host="YOUR HOST HERE",
                     user="YOUR USER HERE", 
                     passwd="YOUR PASSWORD HERE",
                     db="cf_units",
                     use_unicode=True,
                     charset="utf8")
 
cur = db.cursor()

rootdir = 'unitData'

for subdir, dirs, files in os.walk(rootdir):
    for file in files:
        unitFile = open(os.path.join('unitData/', file), "r", encoding="utf-8")
        rawData = unitFile.read().split("\n")
        if rawData[25] == '':
            rawData.pop(25) #account for weird formatting sometimes

        ##UNIT INFO
        unitName = rawData[0].replace("=", "", 20).strip().replace("'","\\'")
        unitImageLink = ("https://cf-wiki.info/_media/units/unit" +
                         str(rawData[1][rawData[1].find(".png")-4:rawData[1].find(".png")])
                         + ".png?cache=") 
        unitID = rawData[1][rawData[1].find(".png")-4:rawData[1].find(".png")] 
        unitRarity = rawData[3].split("|")[-2].strip().count("⭐")
        unitCost = rawData[4].replace("^","|").split("|")[2].strip()
        unitElement = rawData[4].replace("^","|").split("|")[4].strip()
        unitType = rawData[5].replace("^","|").split("|")[2].strip()
        unitTribe = rawData[5].replace("^","|").split("|")[4].replace("None", "").strip()
        unitSellPrice = rawData[7].replace("^","|").split("|")[-3].strip()

        ## STAT INFO
        maxLevel = rawData[10].split("^")[2][rawData[10].split("^")[2].find("lvl ")+4:rawData[10].split("^")[2].find(")")]
        baseLevel = rawData[10].split("^")[3][rawData[10].split("^")[3].find("lvl ")+4:rawData[10].split("^")[3].find(")")]
        maxHP = rawData[11].replace("^","|").split("|")[2].strip()
        baseHP = rawData[11].replace("^","|").split("|")[3].strip()
        maxATK = rawData[12].replace("^","|").split("|")[2].strip()
        baseATK = rawData[12].replace("^","|").split("|")[3].strip()
        maxREC = rawData[13].replace("^","|").split("|")[2].strip()
        baseREC = rawData[13].replace("^","|").split("|")[3].strip()

        ## SKILL INFO
        skillName = rawData[17].split("''")[1].strip().replace("'","\\'")
        skillDescription = rawData[18].split("|")[1].strip().replace("'","\\'")
        skillBaseLevel = rawData[19].replace("^","|").split("|")[2].strip()
        skillMaxLevel = rawData[19].replace("^","|").split("|")[4].strip()

        ## CSKILL INFO
        cSkillName = rawData[22].split("''")[1].strip().replace("'","\\'")
        cSkillDescription = rawData[23].split("|")[1].strip().replace("'","\\'")
        
        ## ABILITY 1
        if rawData[27].find("''") == -1:
            abilityNameOne = 'No Ability'
            abilityTypeOne = 'N/A'
            abilityDescriptionOne = 'N/A'
        else:
            abilityNameOne = rawData[27].split("''")[1].strip().replace("'","\\'") if rawData[27].split("''")[1].strip()[0] != '$' else 'No Ability'
            abilityTypeOne = rawData[28].split("|")[1].strip().replace("'","\\'") if rawData[28].split("|")[1].strip()[0] != '$' else 'N/A'
            abilityDescriptionOne = rawData[28].split("|")[2].strip().replace("'","\\'") if rawData[28].split("|")[2].strip()[0] != '$' else 'N/A'
            
        ## ABILITY 2
        if rawData[29].find("''") == -1:
            abilityNameTwo = 'No Ability'
            abilityTypeTwo = 'N/A'
            abilityDescriptionTwo = 'N/A'
        else:
            abilityNameTwo = rawData[29].split("''")[1].strip().replace("'","\\'") if rawData[29].split("''")[1].strip()[0] != '$' else 'No Ability'
            abilityTypeTwo = rawData[30].split("|")[1].strip().replace("'","\\'") if rawData[30].split("|")[1].strip()[0] != '$' else 'N/A'
            abilityDescriptionTwo = rawData[30].split("|")[2].strip().replace("'","\\'") if rawData[30].split("|")[2].strip()[0] != '$' else 'N/A'

        print(unitID, skillDescription)
        
        # Select data from table using SQL query.
        cur.execute("USE cf_units;")
        cur.execute("""INSERT INTO units VALUES ('%d', '%s', '%s','%d', '%d', '%s', '%s', '%s', '%d')""" \
                    %(int(unitID), unitName, unitImageLink, int(unitRarity), int(unitCost), unitElement, unitType, unitTribe, int(unitSellPrice)))
        cur.execute("""INSERT INTO base_stats VALUES ('%d', '%d', '%d', '%d', '%d')""" \
                    %(int(unitID), int(baseLevel), int(baseHP), int(baseATK), int(baseREC)))
        cur.execute("""INSERT INTO max_stats VALUES ('%d', '%d', '%d', '%d', '%d')""" \
                    %(int(unitID), int(maxLevel), int(maxHP), int(maxATK), int(maxREC)))
        cur.execute("""INSERT INTO skills VALUES ('%d', '%s', '%s', '%d', '%d')""" \
                    %(int(unitID), skillName, skillDescription, int(skillBaseLevel), int(skillMaxLevel)))
        cur.execute("""INSERT INTO cskills VALUES ('%d', '%s', '%s')""" \
                    %(int(unitID), cSkillName, cSkillDescription))
        cur.execute("""INSERT INTO ability_1 VALUES ('%d', '%s', '%s', '%s')""" \
                    %(int(unitID), abilityNameOne, abilityTypeOne, abilityDescriptionOne))
        cur.execute("""INSERT INTO ability_2 VALUES ('%d', '%s', '%s', '%s')""" \
                    %(int(unitID), abilityNameTwo, abilityTypeTwo, abilityDescriptionTwo))
        unitFile.close()

db.commit()
db.close()
