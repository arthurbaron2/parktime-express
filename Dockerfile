# -------------------------------------
# Backend - Parktime Express (TypeScript)
# -------------------------------------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy package files
    COPY package*.json ./
    
    # Install dependencies for build
    RUN npm ci
    
    # Copy source files
    COPY . .
    
    # Build TypeScript project
    RUN npm run build
    
    # -------------------------------------
    # Production image
    # -------------------------------------
    FROM node:20-alpine
    
    WORKDIR /app
    
    # Copy only necessary files from builder
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    COPY --from=builder /app/dist ./dist
    
    # Expose backend port
    EXPOSE 3000
    
    # Launch compiled JS entrypoint
    CMD ["node", "dist/src/index.js"]
    