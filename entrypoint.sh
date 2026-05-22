#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
# You can use a more sophisticated check here if needed

# Run migrations or db push
echo "Running prisma db push..."
prisma db push --accept-data-loss

# Start the application
echo "Starting application..."
node server.js
