FROM node:21

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD ["npx", "nodemon", "src/index.js"]