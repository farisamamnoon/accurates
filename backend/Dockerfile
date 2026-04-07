FROM node:20-alpine
# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ 

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build the TypeScript files
RUN npm run build

# Ensure the database directory exists and has permissions
RUN mkdir -p /app/data

EXPOSE 3000
# Start the compiled JS
CMD ["npm", "start"]
