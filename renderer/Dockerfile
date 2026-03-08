FROM node:20-alpine

WORKDIR /app

COPY renderer/package.json ./package.json
RUN npm install --omit=dev

COPY renderer/server.mjs ./server.mjs

EXPOSE 3000

CMD ["npm", "start"]
