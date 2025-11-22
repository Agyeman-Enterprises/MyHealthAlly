#!/bin/bash
# Bash script to set up environment files
# Run this from the project root: ./SETUP_ENV.sh

echo "Setting up MyHealthAlly environment files..."

# Backend .env
if [ ! -f "packages/backend/.env" ]; then
    cp packages/backend/.env.example packages/backend/.env
    echo "✓ Created packages/backend/.env"
    echo "  ⚠️  Please edit packages/backend/.env and set:"
    echo "     - DATABASE_URL"
    echo "     - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "     - JWT_REFRESH_SECRET"
else
    echo "⚠ packages/backend/.env already exists, skipping"
fi

# Web .env.local
if [ ! -f "packages/web/.env.local" ]; then
    cp packages/web/.env.example packages/web/.env.local
    echo "✓ Created packages/web/.env.local"
    echo "  ⚠️  Please edit packages/web/.env.local and set:"
    echo "     - NEXT_PUBLIC_API_URL"
else
    echo "⚠ packages/web/.env.local already exists, skipping"
fi

# Root .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✓ Created .env"
else
    echo "⚠ .env already exists, skipping"
fi

echo ""
echo "Environment setup complete!"
echo "Next steps:"
echo "1. Edit packages/backend/.env with your database and JWT secrets"
echo "2. Edit packages/web/.env.local with your backend URL"
echo "3. Update API URLs in iOS/Android code if needed"
echo ""
echo "See ENV_SETUP.md for detailed instructions."

