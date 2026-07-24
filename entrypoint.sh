#!/bin/sh

# Fail fast with a clear message if DATABASE_URL was never provided
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo "On Railway, add a variable: DATABASE_URL = \${{Postgres.DATABASE_URL}}"
  exit 1
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
until prisma db push --accept-data-loss; do
  echo "Database is not ready yet - retrying in 2 seconds..."
  sleep 2
done

# Start the application
echo "Starting application..."
node server.js
