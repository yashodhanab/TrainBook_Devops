# node.js image
FROM node:22

# working directory
WORKDIR /app

# Copy package.json. install dependencies
COPY package*.json ./
RUN npm install

# backend source
COPY . .

# backend port
EXPOSE 5000

# start backend
CMD ["npm", "start"]
