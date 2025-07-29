FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY server.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ninjam -u 1001

# Change ownership of the app directory
RUN chown -R ninjam:nodejs /usr/src/app
USER ninjam

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({port: 8080, path: '/', method: 'GET'}, (res) => process.exit(res.statusCode === 426 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"

# Start the application
CMD [ "node", "server.js" ]