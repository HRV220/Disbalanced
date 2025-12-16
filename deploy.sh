#!/bin/bash
# =============================================
# TradingPlatform - Deployment Script
# Server: 147.45.109.121
# =============================================

set -e

# Configuration
SERVER_IP="147.45.109.121"
SERVER_USER="root"
PROJECT_DIR="/opt/tradingplatform"
COMPOSE_FILE="docker-compose.production.yml"

echo "============================================="
echo "TradingPlatform Deployment"
echo "Server: $SERVER_IP"
echo "============================================="

# Check if running on server or locally
if [ "$1" == "local" ]; then
    echo "Running local build test..."

    # Copy production env
    cp .env.production .env

    # Build images
    docker-compose -f $COMPOSE_FILE build

    echo "Local build complete!"
    echo "To start locally: docker-compose -f $COMPOSE_FILE up -d"
    exit 0
fi

if [ "$1" == "server" ]; then
    echo "Deploying to server..."

    # Create project directory on server
    ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${PROJECT_DIR}"

    # Sync project files (excluding unnecessary files)
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude '*.pdf' \
        --exclude 'logs' \
        --exclude 'CoinService/**/bin' \
        --exclude 'CoinService/**/obj' \
        ./ ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/

    # Copy production env
    scp .env.production ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/.env

    # Build and start on server
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${PROJECT_DIR} && \
        docker-compose -f ${COMPOSE_FILE} down --remove-orphans && \
        docker-compose -f ${COMPOSE_FILE} build --no-cache && \
        docker-compose -f ${COMPOSE_FILE} up -d"

    echo "============================================="
    echo "Deployment complete!"
    echo "Frontend: http://${SERVER_IP}:3000"
    echo "Backend:  http://${SERVER_IP}:5000"
    echo "============================================="
    exit 0
fi

echo "Usage:"
echo "  ./deploy.sh local   - Build and test locally"
echo "  ./deploy.sh server  - Deploy to production server"
