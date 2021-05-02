FROM node:15-slim

WORKDIR /usr/src/discordbot

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]