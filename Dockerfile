# Étape 1 : Build NestJS
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 : Image de production + mongodump
FROM node:18-slim

# Installation de mongodump
RUN apt-get update && \
    apt-get install -y mongodb-clients && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

ENV NODE_ENV=production

CMD ["node", "dist/main"]
