#!/bin/bash

# Quick deployment script for MCP server using Docker
# Stops old container, rebuilds image, and redeploys

set -e  # Exit on any error

echo "======================================"
echo "MCP Server Deployment Script"
echo "======================================"
echo ""

# Configuration
CONTAINER_NAME="mcp-server"
IMAGE_NAME="mcp-server:latest"
PORT="3001"

# Load environment variables from .env if it exists
if [ -f .env ]; then
    echo "✓ Loading environment variables from .env"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  No .env file found - using system environment variables"
fi

# Step 1: Stop and remove old container
echo ""
echo "Step 1: Stopping old container..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop ${CONTAINER_NAME} || true
    docker rm ${CONTAINER_NAME} || true
    echo "✓ Old container removed"
else
    echo "✓ No existing container to remove"
fi

# Step 2: Remove old image (optional - comment out to keep image cache)
# echo ""
# echo "Step 2: Removing old image..."
# docker rmi ${IMAGE_NAME} || true

# Step 3: Build new image
echo ""
echo "Step 2: Building new Docker image..."
docker build -t ${IMAGE_NAME} .
echo "✓ Image built successfully"

# Step 4: Run new container
echo ""
echo "Step 3: Starting new container..."
docker run -d \
  --name ${CONTAINER_NAME} \
  -p ${PORT}:${PORT} \
  --restart unless-stopped \
  -e PORT=${PORT} \
  -e HELIUS_API_KEY="${HELIUS_API_KEY}" \
  -e MORALIS_API_KEY="${MORALIS_API_KEY}" \
  -e EXTERNAL_API_KEY="${EXTERNAL_API_KEY}" \
  -e TRADESTATION_API_KEY="${TRADESTATION_API_KEY}" \
  ${IMAGE_NAME}

echo "✓ Container started successfully"

# Step 5: Wait and check health
echo ""
echo "Step 4: Checking container health..."
sleep 3

if docker ps --filter "name=${CONTAINER_NAME}" --filter "status=running" | grep -q ${CONTAINER_NAME}; then
    echo "✓ Container is running"
    echo ""
    echo "======================================"
    echo "Deployment Complete! 🚀"
    echo "======================================"
    echo ""
    echo "Container: ${CONTAINER_NAME}"
    echo "Port:      ${PORT}"
    echo "Endpoint:  http://localhost:${PORT}/mcp"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker logs -f ${CONTAINER_NAME}"
    echo "  Stop:         docker stop ${CONTAINER_NAME}"
    echo "  Restart:      docker restart ${CONTAINER_NAME}"
    echo "  Shell:        docker exec -it ${CONTAINER_NAME} sh"
    echo ""
else
    echo "❌ Container failed to start"
    echo ""
    echo "View logs with: docker logs ${CONTAINER_NAME}"
    exit 1
fi
