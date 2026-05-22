#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
until prisma db push --accept-data-loss; do
  echo "Database is not ready yet - retrying in 2 seconds..."
  sleep 2
done

# Start the application
echo "Starting application..."
node server.js
