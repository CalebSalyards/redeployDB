FROM node:alpine

ENV SERVICE_TYPE = "docker"

WORKDIR /usr/app

COPY package.json /usr/app/
COPY server.js /usr/app/
COPY public /usr/app/
COPY .env /usr/app/

RUN npm install

EXPOSE 9000

CMD ["node", "server.js"]