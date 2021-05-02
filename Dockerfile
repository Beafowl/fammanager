FROM node:15-slim

WORKDIR /usr/src/discordbot

COPY package.json .

RUN npm install

RUN npm install -g backup

COPY . .

CMD ["npm", "start"]
