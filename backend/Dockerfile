# Use Node.js official image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy everything into container
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "index.js"]
