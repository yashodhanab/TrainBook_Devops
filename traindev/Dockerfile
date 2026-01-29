# node.js image
FROM node:22

# working directory
WORKDIR /app

# copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# frontend source
COPY . .

# frontend port
EXPOSE 5173

# frontend start
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
