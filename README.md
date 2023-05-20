# redeployDB
 Database with API for Ringdown Redeploy

## Overview

Ringdown Redeploy is WIP software that aims to provide soft-imaging as a backup/restore or device migration method. In order for it to accomplish this, there needs to be means by which the applciation can automate the installation of applications on a new or recently-reset device.

This database aims to provide that information. Within will contain an ever-growing list of applications, along with the means by which the application can be downloaded and (ideally) automatically installed by the main Ringdown application.

In addition, the database offers the methods by which application data and registry entries can be backed up and restored automatically.

[Software Demo Video](https://drive.google.com/file/d/11xxzFv4iBVCRgnjeyECNCEQGBpqoZ31y/view?usp=share_link)

## Relational Database

The relational database of choice for this project is MySQL Server 8. Why? Mostly because it's relatively low-effort and quick to respond even with much larger datasets. I may migrate things to Redis if it turns out a NoSQL option would be more performant.

The actual structure of the database is as follows:
* `AppData` - The name of the database
    * `Application` - A list of applications tracked by the Redeploy database
    * `InstallMethod` - A many-to-one list of methods any given application can be installed.
    * `RegistryEntries` - A many-to-one list of locations a given application makes entries in the registry. Useful for making backups.
    * `ApplicationData` - A many-to-one list of locations a given application stores its data. Useful for making backups.

## Development Environment

This application is developed using Visual Studio Code, NodeJS, and a MySQL server, optionally running in Docker. I run Windows 11 (for now), so the following terminal commands _should_ set up the environment I use.

```
winget install Docker.DockerDesktop
winget install OpenJS.NodeJS
setx PATH "%PATH%;C:\Program Files\Redis"
```
Once Docker is set up properly on your system, build the docker environment:
```
docker pull mysql
docker run --name appdata -e MYSQL_ROOT_PASSWORD=!!change_me!! -p 3306:3306 -d mysql
```
To access the database, you can use `docker exec -it appdata mysql --user=root --password`, after which you can create the user that NodeJS will use to interact with the server: 

```
CREATE USER 'node' IDENTIFIED WITH mysql_native_password BY 'verifiedgarbagedata';
```

### Packages

This project interacts with the MySQL server using NodeJS, which uses the following npm packages:
* `body-parser` for parsing JSON data received in POST requests.
* `dotenv` for safely keeping credientials outside of the project repository.
* `express` for allowing NodeJS to connect to the outside world.
* `mysql` as the driver module for MySQL server interaction.

Of course, since NodeJS is super convenient, you can just use `npm install` to add the necessary packages.

(Make sure you `git clone` the repository to the desired location)

## Useful Websites

- [MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.0/en)
- [W3 Schools - NodeJS](https://www.w3schools.com/nodejs/)
- [Stack Exchange - Database Administrators](https://dba.stackexchange.com/)
- [MySQL - npm](https://www.npmjs.com/package/mysql)

## Future Work

The database's overall structure is _almost_ where I want it to be. The API, however, is far from ideal.
Among other improvements, there is currently no way to access most of the data in the actual database, which will be necessary if the application is to ever fulfill its end goals.

- Refine permissions (what public users can do)
- Separate access point for admins
- Cleaner de-duplication implementation
- Switch to Redis?
- More SELECT implementations for the application to use!!