#!/bin/bash
set -e

echo "=== Pulling latest code ==="
git pull

echo "=== Building Docker image (no cache) ==="
docker compose build --no-cache

echo "=== Restarting container ==="
docker compose up -d

echo "=== Waiting 5s for startup ==="
sleep 5

echo "=== Health check ==="
curl -f http://localhost:3099/ || echo "HEALTH CHECK FAILED"

echo ""
echo "=== Cleaning old images ==="
docker image prune -f

echo "=== Deploy complete ==="
