# redeployDB
 Database with API for Ringdown Redeploy

## Overview

{Important! Do not say in this section that this is college assignment. Talk about what you are trying to accomplish as a software engineer to further your learning.}

{Provide a description of the software that you wrote and how it integrates with a SQL Relational Database. Describe how to use your program.}

{Describe your purpose for writing this software.}

{Provide a link to your YouTube demonstration. It should be a 4-5 minute demo of the software running, a walkthrough of the code, and a view of how created the Relational Database.}

[Software Demo Video](http://youtube.link.goes.here)

## Relational Database

{Describe the relational database you are using.}

{Describe the structure (tables) of the relational database that you created.}

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

{Make a list of things that you need to fix, improve, and add in the future.}

- Item 1
- Item 2
- Item 3