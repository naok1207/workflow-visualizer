FROM node:20-alpine AS base

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Development stage
FROM base AS development

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY mcp-server/package*.json ./mcp-server/
COPY shared/package*.json ./shared/

# Install all dependencies
RUN npm install

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3000

# Production stage
FROM base AS production

# Copy package files
COPY package*.json ./
COPY mcp-server/package*.json ./mcp-server/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY mcp-server ./mcp-server
COPY shared ./shared

# Build the application
WORKDIR /app
RUN npm run build:shared && npm run build:mcp

# Create data directory
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "mcp-server/dist/server.js"]