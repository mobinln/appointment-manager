FROM node:22-bullseye-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --include=dev

COPY . .

RUN npm run build

FROM node:22-bullseye-slim AS production

RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --shell /bin/bash --create-home nodejs

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/package.json ./

USER nodejs

EXPOSE 3000

CMD ["node", "dist/app.js"]