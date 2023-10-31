const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const dotenv = require('dotenv').config();

const webApp = express();
const port = 9000;
const mysqlClient = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD
});

const debugMode = false;
const toRed = '\x1b[31m'
const toWhite = '\x1b[0m'

webApp.listen(port, () => {
    mysqlClient.connect((error) => {
        console.log("Connecting to Database...");
        if (error) {
            if (error.code == 'ECONNREFUSED') {
                console.log(toRed + 'The database appears to be turned off.' + toWhite);
                process.exit()
            } else {
                throw error;
            }
        } else {
            console.log("Connected to MySQL Server");
        }
    });
    mysqlClient.query('USE AppData;')
    console.log("Listening on port: " + port);
});

webApp.use(express.static('public'));

webApp.get('/add-application', (request, result) => {
    console.log("GET request received. (application)")
    result.sendFile(__dirname + '/public/add-application.html');
});

webApp.get('/add-install-method', (request, result) => {
    console.log("GET request received (install).")
    result.sendFile(__dirname + '/public/add-install-method.html');
});

webApp.get('/add-registry-info', (request, result) => {
    console.log("GET request received (registry).")
    result.sendFile(__dirname + '/public/add-registry-info.html');
});

webApp.get('/add-data-location', (request, result) => {
    console.log("GET request received (data).")
    result.sendFile(__dirname + '/public/add-data-location.html');
});

webApp.get('/add-tag', (request, result) => {
    console.log("GET request received (tag).")
    result.sendFile(__dirname + '/public/add-tag.html');
});

webApp.get('/search', (request, result) => {
    console.log("GET request received (search).")
    result.sendFile(__dirname + '/public/search.html');
});

webApp.get('/Robtronika.ttf', (request, result) => {
    console.log("GET request received (font).")
    result.sendFile(__dirname + '/public/Robtronkia.tff');
});

webApp.get('/api/known-programs', async (request, result) => {
    let body = request.body;
    mysqlClient.query('SELECT ID, Uninstaller FROM Application;', (error, results, fields) => {
        if (error) throw error;
        if (results.length) {
            output = {}
            output['header'] = 'Found ' + results.length + ' known programs.';
            output['results'] = [];
            for (var i in results) {
                output['results'][i] = {};
                output['results'][i]['name'] = results[i].Uninstaller;
            }
        } else {
            result.status(503)
            output = {}
            output['header'] = 'No known programs.';
        }
        result.send(JSON.stringify(output));
    });
});

webApp.get('/api/known-data', async (request, result) => {
    mysqlClient.query('SELECT ApplicationID, DataLocation, Path, Folder FROM ApplicationData;', (error, results, fields) => {
        if (error) throw error;
        if (results.length) {
            output = {}
            output['header'] = 'Found' + result.length + ' known folders.';
            output['results'] = [];
            for (var i in results) {
                output['results'][i] = {};
                output['results'][i]['DataLocation'] = results[i].DataLocation;
                output['results'][i]['Path'] = results[i].Path;
                output['results'][i]['Folder'] = results[i].Folder;
            }
        } else {
            result.status(503)
            output = {}
            output['header'] = 'No known data locations.';
        }
        result.send(JSON.stringify(output));
    });
});

webApp.get('/api/known-registries', async (request, result) => {
    mysqlClient.query('SELECT ApplicationID, KeyLocation, Path FROM RegistryEntries;', (error, results, fields) => {
        if (error) throw error;
        if (results.length) {
            output = {}
            output['header'] = 'Found' + result.length + ' known folders.';
            output['results'] = [];
            for (var i in results) {
                output['results'][i] = {};
                output['results'][i]['KeyLocation'] = results[i].KeyLocation;
                output['results'][i]['Path'] = results[i].Path;
            }
        } else {
            result.status(503)
            output = {}
            output['header'] = 'No known registry entries.';
        }
        result.send(JSON.stringify(output));
    });
});

webApp.get('*', (request, result) => {
    //404 Catch-all
    stamp = new Date().toLocaleString()
    console.log("Unknown GET request received at " + stamp + ": " + request.url)
    result.status(404).send('Error: 404 not found.');
});

webApp.use(bodyParser.json());
webApp.use(bodyParser.urlencoded({ extended: false}));

webApp.post('/add-prog', async (request, result) => {
    console.log("POST request received at /add-prog");
    let body = request.body;
    let name = mysqlClient.escape(body.name);
    let searchable_name = mysqlClient.escape("%" + body.name + "%")
    let uninstaller = mysqlClient.escape(body.uninstaller);
    let homepage = mysqlClient.escape(body.homepage);
    let version = mysqlClient.escape(body.version);
    let tags = mysqlClient.escape(body.tags);
    let newID = -1;
    mysqlClient.query('SELECT count(*) AS Duplicates FROM Application WHERE (Name = ?) AND (Uninstaller = ?);', [name, uninstaller], (error, results, fields) => {
        if (error) throw error;
        if ((results[0].Duplicates) && (debugMode == false)) {
            const resultString = 'An Application under the name ' + name + ' with the uninstaller name of ' + uninstaller + ' already exists.';
            console.log(resultString);
            result.send(resultString);
            return
        }
        // mysqlClient.query('SELECT AUTO_INCREMENT AS "newID" FROM information_schema.TABLES WHERE TABLE_SCHEMA = "AppData" AND TABLE_NAME = "Application"', (error, results, fields) => {
            mysqlClient.query('INSERT INTO Application (Name, Uninstaller, Homepage, Version, Tags) VALUES (?, ?, ?, ?, JSON_ARRAY(?));', [name, uninstaller, homepage, version, tags], (error, results, fields) => {
                if (error) throw error;
                let resultString = ""
                mysqlClient.query('SELECT ID AS "newID" FROM Application WHERE Name LIKE ?', [searchable_name], (error, results, fields) => {
                    if (error) throw error;
                    newID = results[0]['newID']
                    resultString = "Added " + name + " to the 'Applications' list (ID: " + newID + ")";
                    console.log(resultString);
                    result.send(resultString + '\n');
                });
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
    let folder = mysqlClient.escape(body.folder)
    mysqlClient.query('INSERT INTO RegistryEntries (ApplicationID, KeyLocation, Path, Folder) VALUES (?, ?, ?, ?);', [applicationID, keyLocation, path, folder], (error, results, fields) => {
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
    console.log(body.query)
    mysqlClient.query('SELECT ID, Name, Uninstaller FROM Application WHERE (Name LIKE ?) OR (Uninstaller LIKE ?) OR (JSON_SEARCH(Tags, "one", ?));', [query, query, query], (error, results, fields) => {
        if (error) throw error;
        if (results.length) {
            output = {}
            output['header'] = 'Found ' + results.length + ' results for "' + body.query + '"';
            output['results'] = [];
            for (var i in results) {
                output['results'][i] = {};
                output['results'][i]['ID'] = results[i].ID
                output['results'][i]['name'] = results[i].Name;
            }
        } else {
            output = {}
            output['header'] = 'No results found for "' + body.query + '"';
        }
        console.log(JSON.stringify(output));
        result.send(JSON.stringify(output));
    });
    // mysqlClient.query('SELECT ID, Name, Uninstaller FROM Application WHERE (Name LIKE ?) OR (Uninstaller LIKE ?) OR (JSON_SEARCH(Tags, "one", ?));', [query, query, query], (error, results, fields) => {
    //     if (error) throw error;
    //     if (results.length) {
    //         output = 'Found ' + results.length + ' results for "' + body.query + '"\n';
    //         for (var i in results) {
    //             output = output + 'ID: ' + results[i].ID + "\tName: " + results[i].Name + '\n';
    //         }
    //     } else {
    //         output = 'No results found for "' + body.query;
    //     }
    //     console.log(output);
    //     result.send(output);
    // });
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