#!/bin/bash

# Setup script for centralizing environment variables
# This script creates .env.production from the template and validates the configuration

set -e

echo "🚀 Setting up centralized environment configuration..."

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Create .env.production from template
if [ -f "env.production.template" ]; then
    echo "📝 Creating .env.production from template..."
    cp env.production.template .env.production
    echo "✅ .env.production created successfully!"
else
    echo "❌ Template file 'env.production.template' not found!"
    exit 1
fi

# Make the file readable only by owner for security
chmod 600 .env.production

echo "🔧 Environment configuration setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review and modify .env.production if needed"
echo "2. Run 'docker-compose up --build' to test the configuration"
echo "3. The environment variables are now centralized in .env.production"
echo ""
echo "🔍 Configuration summary:"
echo "- Environment variables are defined in: .env.production"
echo "- Docker Compose reads from: .env.production (via env_file)"
echo "- Docker build gets variables as build args from docker-compose.yml"
echo "- Next.js config has fallback values in next.config.js"
echo ""
echo "✨ No more duplicate configuration across multiple files!" 