FROM node:22.12-alpine

WORKDIR /app

# Install curl for the HEALTHCHECK and install npm deps
COPY package.json package-lock.json ./
RUN apk add --no-cache curl && npm install --production

# Copy application
COPY . .

# Expose the default port used by the server (can be overridden with PORT)
EXPOSE 3001

# Run the MCP server in HTTP (streamable) mode by default so health checks succeed
CMD ["node", "mcpServer.js", "--streamable-http"]

# DigitalOcean/other platforms will probe this endpoint to confirm container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD curl -f http://127.0.0.1:3001/mcp || exit 1