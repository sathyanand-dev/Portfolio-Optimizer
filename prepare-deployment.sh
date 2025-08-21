#!/bin/bash

echo "🚀 Preparing Portfolio Optimizer for Deployment"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "Expected structure: backend/, frontend/, README.md"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Portfolio Optimizer"
else
    echo "✅ Git repository already exists"
fi

# Check backend requirements
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Error: backend/requirements.txt not found"
    exit 1
else
    echo "✅ Backend requirements.txt found"
fi

# Check if frontend build works
echo "🔨 Testing frontend build..."
cd frontend
if npm run build; then
    echo "✅ Frontend build successful"
    cd ..
else
    echo "❌ Frontend build failed - please fix errors first"
    cd ..
    exit 1
fi

# Check if backend starts
echo "🔨 Testing backend startup..."
cd backend
if python -c "from main import app; print('✅ Backend imports successful')"; then
    echo "✅ Backend startup test passed"
    cd ..
else
    echo "❌ Backend startup test failed"
    cd ..
    exit 1
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Project structure:"
echo "├── backend/     (Deploy to Render)"
echo "├── frontend/    (Deploy to Vercel)"
echo "└── README.md    (Documentation)"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy backend to Render (set root directory to 'backend')"
echo "3. Deploy frontend to Vercel (set root directory to 'frontend')"
echo "4. Update environment variables with actual URLs"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
