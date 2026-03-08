# Stage 1: Build the React Application
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install ALL dependencies (including dev ones like Vite)
RUN npm install

# Copy source code and config
COPY . .

# Environment variable for the backend API during build (Vite requires it prefix with VITE_)
ARG VITE_API_URL="/api"
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# Stage 2: Serve with NGINX (Production-grade reverse proxy)
FROM nginx:1.25-alpine

# Copy built assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for handle client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
