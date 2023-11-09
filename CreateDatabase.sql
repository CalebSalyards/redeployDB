DROP DATABASE AppData;
CREATE DATABASE AppData;
USE AppData;
CREATE TABLE Application (
    ID INT NOT NULL UNIQUE AUTO_INCREMENT,
    Name VARCHAR(64) NOT NULL,
    Uninstaller VARCHAR(64),
    Homepage VARCHAR(256),
    Version VARCHAR(256) NOT NULL,
    Tags JSON DEFAULT JSON_ARRAY(),
    PRIMARY KEY (ID)
);
CREATE TABLE InstallMethod (
    ID INT NOT NULL UNIQUE AUTO_INCREMENT,
    ApplicationID INT NOT NULL,
    InstallMethod ENUM(
        'Automated', 
        'WinGet', 
        'Manual'
        ) NOT NULL,
    Location VARCHAR(256) NOT NULL,
    SilentFlag VARCHAR(16),
    PathFlag VARCHAR(16),
    PRIMARY KEY (ID),
    FOREIGN KEY (ApplicationID)
        REFERENCES Application(ID)
);
CREATE TABLE RegistryEntries (
    ID INT NOT NULL UNIQUE AUTO_INCREMENT,
    ApplicationID INT NOT NULL,
    KeyLocation ENUM(
        'User', 
        'System', 
        'Other'
        ) NOT NULL,
    Path TEXT(65535) NOT NULL,
    Folder BOOL NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (ApplicationID)
        REFERENCES Application(ID)
);
CREATE TABLE ApplicationData (
    ID INT NOT NULL UNIQUE AUTO_INCREMENT,
    ApplicationID INT NOT NULL,
    DataLocation ENUM(
        'Local', 
        'Roaming', 
        'Documents', 
        'Saved Games', 
        'Other'
        ) NOT NULL,
    Path TEXT(65535) NOT NULL,
    Folder BOOL NOT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (ApplicationID)
        REFERENCES Application(ID)
);

-- Reset DB:
/* 
DELETE FROM InstallMethod;
ALTER TABLE InstallMethod AUTO_INCREMENT = 1;
DELETE FROM RegistryEntries;
ALTER TABLE RegistryEntries AUTO_INCREMENT = 1;
DELETE FROM ApplicationData;
ALTER TABLE ApplicationData AUTO_INCREMENT = 1;
DELETE FROM Application;
ALTER TABLE Application AUTO_INCREMENT = 1;
*/