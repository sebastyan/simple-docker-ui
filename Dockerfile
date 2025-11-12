FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the frontend
RUN npm run build

# Set production environment
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
