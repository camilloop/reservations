FROM node:22.16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
copy . .
RUN npm run build
#EXPOSE 3000
#HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
#  CMD curl -f http://localhost:3000/health || exit 1
CMD [ "node", "dist/main.js" ]