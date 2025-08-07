# Use Node.js official image
FROM node:18

# Set working directory inside container
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything into container
COPY . .

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "index.js"]
