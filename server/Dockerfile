FROM node:22-alpine

WORKDIR /app

# Install deps first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma client for runtime
RUN npx prisma generate

EXPOSE 5000

# Launch API directly on Render; migrations should run as a controlled release step.
CMD ["sh", "-c", "exec node src/index.js"]
