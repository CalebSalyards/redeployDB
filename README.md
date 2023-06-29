# Overview

Ringdown Redeploy is WIP software that aims to provide soft-imaging as a backup/restore or device migration method. In order for it to accomplish this, there needs to be means by which the applciation can automate the installation of applications on a new or recently-reset device.

This database aims to provide that information. Within will contain an ever-growing list of applications, along with the means by which the application can be downloaded and (ideally) automatically installed by the main Ringdown application.

In addition, the database offers the methods by which application data and registry entries can be backed up and restored automatically.

This repository contains both the frontend and backend parts of the web app that can be used to add new applications to the database.

[Back-end Demo Video](https://drive.google.com/file/d/11xxzFv4iBVCRgnjeyECNCEQGBpqoZ31y/view?usp=share_link)
[Front-end Demo Video](http://youtube.link.goes.here)

# Web Pages

Most of these web pages are currently static, due to the relative lack of dynamic requirements and time contraints. Basically, it's faster for me to copy and paste code than to learn how to generate the code with the custom changes the individual pages need.

Where I couldn't do this was the search page, which uses a front-end JavaScript function set to add the search results to the loaded webpage.

## Relational Database

The relational database of choice for this project is MySQL Server 8. Why? Mostly because it's relatively low-effort and quick to respond even with much larger datasets. I may migrate things to Redis if it turns out a NoSQL option would be more performant.

# Development Environment

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

Once you have Docker set up and ready, clone this repository, and open it in VS Code, then open a console and set up the environment with `npm install`. Now, you'll just need to run `node ./server.js` to start the server, and you're good to go!

# Deployment
The following steps are for rudimentary cloud deployment using a Docker engine. Stuff might work out-of-the-box with Kubernetes, but it's probably missing a lot of valuable integrations that would make using Kubernetes worth it.

## Prerequisites
1. A Docker environment (WSL, Linux VM, etc.)
2. Git is installed.
3. A (preferrably static) public IP address or web domain.

## Build the Server
1. Use `git clone` to obtain a copy of this repository.
2. Use the `cd` command to navigate into the repository.
3. Execute the `docker-build.sh` file to build the image.

## Create a Docker network
In order for the images to connect to each other, they need a network to talk over.

`docker network create redeploynet`

## Setup the Database
Note: There are several fields where you will need to specify a username or password. Make sure you replace the relevant text with what you want or you may have issues.
1. Get the MySQL base image with `docker pull mysql`
2. Start an instance of the database: `docker  run --name appdata -e MYSQL_ROOT_PASSWORD=[your_admin_password_here] -p 3306:3306 -d mysql`
3. Add the container to the Docker network: `docker network connect --ip 192.168.0.2 redeploynet appdata`
4. Access the new container to populate the database: `docker exec -it appdata mysql --user=root --password`
5. Refer to the contents of CreateDatabase.sql to populate the database structure.
6. Create your server user:
```sql
CREATE USER 'username_here' IDENTIFIED WITH mysql_native_password BY 'password_here';
GRANT SELECT, INSERT, UPDATE ON *.* TO 'username_here'@'%';
GRANT DELETE ON AppData.Application TO 'username_here'@'%';
```
7. Leave the container interface with the `exit` command.

## Setup the Server
1. Using the server credentials you specified in the MySQL database, create the container for your web server:

`docker run --name redeployDB --network=redeploynet -e HOST=192.168.0.2 -e USER=[server_username] -e PASSWORD=[server_password] -p 80:9000 -d redeploydb`

# Useful Websites

## Back-end
* [W3 Schools - CSS](https://www.w3schools.com/css/default.asp)
* [LogRocket - Console Colors with Node.js](https://blog.logrocket.com/using-console-colors-node-js/)
* [Wikipedia - ANSI Escape Code Colors](https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors)

## Front-end
- [MySQL Reference Manual](https://dev.mysql.com/doc/refman/8.0/en)
- [W3 Schools - NodeJS](https://www.w3schools.com/nodejs/)
- [Stack Exchange - Database Administrators](https://dba.stackexchange.com/)
- [MySQL - npm](https://www.npmjs.com/package/mysql)

# Future Work
The database's overall structure is _almost_ where I want it to be. The API, however, is far from ideal.
Among other improvements, there is currently no way to access most of the data in the actual database, which will be necessary if the application is to ever fulfill its end goals.

### Back-end Feature List
- Refine permissions (what public users can do)
- Separate access point for admins
- Cleaner de-duplication implementation
- Switch to Redis?
- More SELECT implementations for the application to use!!

### Front-end Feature List
* Fix tag addition
* Dynamic Generation of entry-addition pages
* Displays 'loading' screen in between request and display of query data