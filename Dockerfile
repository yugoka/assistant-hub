FROM node:18.18.0-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install -g ts-node

COPY . .

EXPOSE 3000
