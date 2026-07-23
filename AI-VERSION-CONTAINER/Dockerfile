FROM node:20-alpine

WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
