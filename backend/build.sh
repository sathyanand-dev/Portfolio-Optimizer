#!/bin/bash
# Build script for Render (from backend directory)
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

echo "Build completed successfully!"
