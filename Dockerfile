FROM node:22-alpine

WORKDIR /application

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3100

CMD ["node", "dist/main.js"]