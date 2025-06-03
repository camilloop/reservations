FROM node:22.16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
copy . .
RUN npm run build
CMD [ "node", "dist/main.js" ]