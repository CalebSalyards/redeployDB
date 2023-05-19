const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const dotenv = require('dotenv').config();

const webApp = express();
const port = 9000;
const mysqlClient = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD
});

const debugMode = true;

webApp.listen(port, () => {
    mysqlClient.connect((error) => {
        if (error) {
            if (error.code == 'ECONNREFUSED') {
                console.log("The database appears to be turned off.");
                process.exit()
            } else {
                throw error;
            }
        }
    });
    mysqlClient.query('USE AppData;')
    console.log("Connected to MySQL Server");
    console.log("Listening on port: " + port);
});

webApp.get('/', (request, result) => {
    console.log("GET request received.")
    result.send("<h1>Welcome, welcome! There's nothing here for now.</h1>");
});

webApp.use(bodyParser.json());

webApp.post('/add-prog', async (request, result) => {
    console.log("POST request received at /add-prog");
    let body = request.body;
    let name = mysqlClient.escape(body.name);
    let uninstaller = mysqlClient.escape(body.uninstaller);
    let homepage = mysqlClient.escape(body.homepage);
    let version = mysqlClient.escape(body.version);
    let tags = mysqlClient.escape(body.tags);
    mysqlClient.query('SELECT count(*) AS Duplicates FROM Application WHERE (Name = ?) AND (Uninstaller = ?);', [name, uninstaller], (error, results, fields) => {
        if (error) throw error;
        if ((results[0].Duplicates) && (debugMode == false)) {
            const resultString = 'An Application under the name ' + name + ' with the Uninstall name of ' + uninstaller + ' already exists.';
            console.log(resultString);
            result.send(resultString);
            return
        }
        mysqlClient.query('INSERT INTO Application (Name, Uninstaller, Homepage, Version, Tags) VALUES (?, ?, ?, ?, JSON_ARRAY(?));', [name, uninstaller, homepage, version, tags], (error, results, fields) => {
            if (error) throw error;
                const resultString = "Added " + name + " to the 'Applications' list"
                console.log(resultString);
                result.send(resultString + '\n');
            });
    });
});

webApp.post('/add-install-method', async (request, result) => {
    let body = request.body;
    let applicationID = mysqlClient.escape(body.applicationID);
    let installMethod = "";
    switch(body.installMethod) {
        case "WinGet":
            installMethod = "WinGet";
            break;
        case "Automated":
            installMethod = "Automated";
            break;
        case "Manual":
            installMethod = "Manual";
            break;
        default:
            result.send("Invalid 'Install Method' indicated.\nPlease use 'WinGet', 'Automated', or 'Manual'.");
            return;
    }
	let location = mysqlClient.escape(body.location);
	let silentFlag = mysqlClient.escape(body.silentFlag);
	let pathFlag = mysqlClient.escape(body.pathFlag);
    mysqlClient.query('INSERT INTO InstallMethod (ApplicationID, InstallMethod, Location, SilentFlag, PathFlag) VALUES (?, ?, ?, ?, ?);', [applicationID, installMethod, location, silentFlag, pathFlag], (error, results, fields) => {
        if (error) throw error;
    });
    const resultString = "Added a " + installMethod + " option to the 'Install Methods' list"
    console.log(resultString);
    result.send(resultString + '\n');
});

webApp.post('/add-registry-info', async (request, result) => {
    let body = request.body;
    let applicationID = mysqlClient.escape(body.applicationID);
    switch(body.keyLocation) {
        case "User":
            keyLocation = "User";
            break;
        case "System":
            keyLocation = "System";
            break;
        case "Other":
            keyLocation = "Other";
            break;
        default:
            result.send("Invalid 'Key Location' indicated.\nPlease use 'User', 'System', or 'Other'.");
            return;
    }
	let path = mysqlClient.escape(body.path);
    mysqlClient.query('INSERT INTO RegistryEntries (ApplicationID, KeyLocation, Path) VALUES (?, ?, ?);', [applicationID, keyLocation, path], (error, results, fields) => {
        if (error) throw error;
    });
    const resultString = "Added a " + keyLocation + " option to the 'Registry' list"
    console.log(resultString);
    result.send(resultString + '\n');
});

webApp.post('/add-data-location', async (request, result) => {
    let body = request.body;
    let applicationID = mysqlClient.escape(body.applicationID);
    switch(body.dataLocation) {
        case "Local":
            dataLocation = "Local";
            break;
        case "Roaming":
            dataLocation = "Roaming";
            break;
        case "Documents":
            dataLocation = "Documents";
            break;
        case "Saved Games":
            dataLocation = "Saved Games";
            break;
        case "Other":
            dataLocation = "Other";
            break;
        default:
            result.send("Invalid 'Data Location' indicated.\nPlease use 'Local', 'Roaming', 'Documents', 'Saved Games', or 'Other'.");
            return;
    }
	let path = mysqlClient.escape(body.path);
	let folder = mysqlClient.escape(body.folder);
    mysqlClient.query('INSERT INTO ApplicationData (ApplicationID, DataLocation, Path, Folder) VALUES (?, ?, ?, ?);', [applicationID, dataLocation, path, folder], (error, results, fields) => {
        if (error) throw error;
    });
    const resultString = "Added a location in " + dataLocation + " option to the 'Application Data' list"
    console.log(resultString);
    result.send(resultString + '\n');
});

webApp.post('/add-tag', async (request, result) => {
    let body = request.body;
    let applicationID = mysqlClient.escape(body.applicationID);
    let newTag = mysqlClient.escape(body.newTag);
    mysqlClient.query('UPDATE Application SET tags = JSON_ARRAY_APPEND(tags, "$", ?) WHERE ID = ?;', [newTag, applicationID], (error, results, fields) => {
        if (error) throw error;
    });
    const resultString = "Added tag: " + newTag + " to the list"
    console.log(resultString);
    result.send(resultString + '\n');
})

webApp.post('/search', async (request, result) => {
    let body = request.body;
    let query = mysqlClient.escape('%' + body.query + '%');
    mysqlClient.query('SELECT ID, Name, Uninstaller FROM Application WHERE (Name LIKE ?) OR (Uninstaller LIKE ?) OR (JSON_SEARCH(Tags, "one", ?));', [query, query, query], (error, results, fields) => {
        if (error) throw error;
        if (results.length) {
            output = 'Found ' + results.length + ' results for "' + body.query + '"\n';
            for (var i in results) {
                output = output + 'ID: ' + results[i].ID + "\tName: " + results[i].Name + '\n';
            }
        } else output = 'No results found for "' + body.query;
        console.log(output);
        result.send(output);
    });
})

webApp.post('/dedupe', async (request, result) => {
    let appList = undefined;
    let pruneList = [];
    mysqlClient.query('SELECT ID, Name, Uninstaller FROM Application;', (error, results, fields) => {
        appList = results;
        for (i in appList) {
            // console.log("Moving to " + i);
            for (j in appList) {
                if (appList[i].ID < appList[j].ID) {
                    // console.log('Comparing entry ' + i + ' to entry ' + j);
                    if (appList[i].Name === appList[j].Name) {
                        // console.log("Name matches")
                        if (appList[i].Uninstaller === appList[j].Uninstaller) {
                            // console.log("Uninstaller matches")
                            pruneList.push(appList[j].ID);
                        }
                    } 
                }

            }
        }
        for (i in pruneList) {
            mysqlClient.query('DELETE FROM Application WHERE ID=?;', [pruneList[i]], (error, results, fields) => {
                if (error) throw error;
            });
        }
        console.log('Deleted ' + pruneList.length + ' duplicate entries.');
        result.send('Deleted ' + pruneList.length + ' duplicate entries.');
    });
});