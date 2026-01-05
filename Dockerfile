# ---------- Build stage ----------
    FROM node:24-alpine AS build
    WORKDIR /app
    
    # Install deps (including dev deps needed to compile TS)
    COPY package*.json ./
    RUN npm ci
    
    # Copy source and compile
    COPY tsconfig.json ./
    COPY src ./src
    RUN npm run build
    
    # ---------- Runtime stage ----------
    FROM node:24-alpine AS runtime
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Install only production deps
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # Copy compiled output
    COPY --from=build /app/dist ./dist
    
    # (Optional) if you need runtime files later, copy them too:
    # COPY --from=build /app/package.json ./package.json
    
    EXPOSE 3000
    
    CMD ["node", "dist/server.js"]
    