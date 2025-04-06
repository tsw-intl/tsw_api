# Étape 1 : Build NestJS
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Étape 2 : Image de production + mongodump
FROM node:18-alpine

# Installation de mongodump via mongodb-tools
RUN apk add --no-cache mongodb-tools

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Utilisation de npm ci pour une installation rapide et fiable
RUN npm ci --only=production

ENV NODE_ENV=production

CMD ["node", "dist/main"]
