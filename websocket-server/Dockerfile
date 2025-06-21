FROM node:20-alpine AS base

WORKDIR /app

# Development stage
FROM base AS development

# Copy root package files
COPY package*.json ./

# Copy workspace package files
COPY websocket-server/package*.json ./websocket-server/
COPY shared/package*.json ./shared/

# Install all dependencies
RUN npm install

EXPOSE 3001

# Production stage
FROM base AS production

# Copy package files
COPY package*.json ./
COPY websocket-server/package*.json ./websocket-server/
COPY shared/package*.json ./shared/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy source code
COPY websocket-server ./websocket-server
COPY shared ./shared

# Build the application
WORKDIR /app
RUN npm run build:shared && npm run build:websocket

EXPOSE 3001

CMD ["node", "websocket-server/dist/server.js"]