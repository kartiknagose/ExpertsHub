# 1. Base image (Production-ready Node.js)
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Environment (Production ensures better performance and security)
ENV NODE_ENV production

# 4. Copy package.json and package-lock.json
COPY package*.json ./

# 5. Install dependencies — only production ones to keep image slim
RUN npm ci --omit=dev

# 6. Copy Prisma Schema (Must be before generate)
COPY prisma ./prisma/

# 7. Generate Prisma Client (Needs devDep for binary but we installed with --omit=dev? 
# No, prisma is usually in dev but we need it for binary. Actually better stay in non-omit for build part.)
RUN npx prisma generate

# 8. Copy the rest of the application
COPY . .

# 9. Expose port 5000 (Backend)
EXPOSE 5000

# 10. Start server with wait tool if needed, or just start
# Better: health check and migration on startup
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
