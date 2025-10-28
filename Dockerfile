# -------------------------------------
# Backend - Parktime Express (TypeScript runtime build)
# -------------------------------------
    FROM node:20-alpine

    # Create working directory
    WORKDIR /app
    
    # Copy package files
    COPY package*.json ./
    
    # Install dependencies (including dev because we need TypeScript to compile)
    RUN npm ci
    
    # Copy all source files
    COPY . .
    
    # Expose backend port
    EXPOSE 3000
    
    # Compile + Run
    CMD ["sh", "-c", "npx tsc && node dist/src/index.js"]
    