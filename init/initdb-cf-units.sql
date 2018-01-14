-- This file initializes a MySQL DB with the relevant parameters for running Belial Bot. 
-- Please run this before running the Python scripts.

CREATE DATABASE cf_units;
USE cf_units;
CREATE TABLE units (
	UnitID int NOT NULL,
	UnitName VARCHAR(255) CHARACTER SET utf8 NOT NULL,
    UnitImageLink VARCHAR(255),
    UnitRarity int,
    UnitCost int,
    UnitElement VARCHAR(10),
    UnitType VARCHAR(255),
    UnitTribe VARCHAR(255),
    UnitSellPrice int,
    PRIMARY KEY(UnitID)
);

CREATE TABLE base_stats (
	UnitID int NOT NULL,
    BaseLevel int,
	HP int,
    ATK int,
    REC int,
    PRIMARY KEY(UnitID)
);

CREATE TABLE max_stats (
	UnitID int NOT NULL,
    MaxLevel int,
	HP int,
    ATK int,
    REC int,
    PRIMARY KEY(UnitID)
);

CREATE TABLE skills (
	UnitID int NOT NULL,
	SkillName VARCHAR(255) CHARACTER SET utf8,
    SkillDescription VARCHAR(2083),
    SkillBaseCD int,
    SkillFinalCD int,
    PRIMARY KEY(UnitID)
);

CREATE TABLE cskills (
	UnitID int NOT NULL,
	CSkillName VARCHAR(255) CHARACTER SET utf8,
    CSkillDescription VARCHAR(2083),
    PRIMARY KEY(UnitID)
);

CREATE TABLE ability_1 (
	UnitID int NOT NULL,
	AbilityName VARCHAR(255),
    AbilityType VARCHAR(255),
    AbilityDescription VARCHAR(2083),
    PRIMARY KEY(UnitID)
);

CREATE TABLE ability_2 (
	UnitID int NOT NULL,
	AbilityName VARCHAR(255),
    AbilityType VARCHAR(255),
    AbilityDescription VARCHAR(2083),
    PRIMARY KEY(UnitID)
);

CREATE TABLE ability_3 (
	UnitID int NOT NULL,
	AbilityName VARCHAR(255),
    AbilityType VARCHAR(255),
    AbilityDescription VARCHAR(2083),
    PRIMARY KEY(UnitID)
);

CREATE TABLE ability_4 (
	UnitID int NOT NULL,
	AbilityName VARCHAR(255),
    AbilityType VARCHAR(255),
    AbilityDescription VARCHAR(2083),
    PRIMARY KEY(UnitID)
);

CREATE TABLE ability_5 (
	UnitID int NOT NULL,
	AbilityName VARCHAR(255),
    AbilityType VARCHAR(255),
    AbilityDescription VARCHAR(2083),
    PRIMARY KEY(UnitID)
);