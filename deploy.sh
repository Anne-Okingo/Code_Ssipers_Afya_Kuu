#!/bin/bash

# Afya Kuu Deployment Script for Render
echo "🚀 Preparing Afya Kuu for Render deployment..."

# Check if we're in the right directory
if [ ! -f "flask_rf_api.py" ]; then
    echo "❌ Error: flask_rf_api.py not found. Please run this script from the project root."
    exit 1
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/
env.bak/
venv.bak/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/

# Package managers
package-lock.json
yarn.lock

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp
*.log

# IDE
.vscode/
.idea/

# Jupyter Notebook
.ipynb_checkpoints
EOF
fi

echo "✅ Deployment files created successfully!"
echo ""
echo "📋 Next steps to deploy on Render:"
echo ""
echo "1. 🔗 Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render deployment'"
echo "   git push origin main"
echo ""
echo "2. 🌐 Go to https://render.com and sign up/login"
echo ""
echo "3. 📦 Create two new Web Services:"
echo ""
echo "   🔧 BACKEND SERVICE:"
echo "   - Name: afya-kuu-api"
echo "   - Environment: Python 3"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: python flask_rf_api.py"
echo "   - Port: 5001"
echo ""
echo "   🎨 FRONTEND SERVICE:"
echo "   - Name: afya-kuu-frontend"
echo "   - Environment: Node"
echo "   - Root Directory: Frontend/Code-Her-Care/afya-kuu"
echo "   - Build Command: npm ci && npm run build"
echo "   - Start Command: npm start"
echo "   - Port: 3000"
echo ""
echo "4. ⚙️  Set Environment Variables:"
echo "   Backend: FLASK_ENV=production"
echo "   Frontend: NEXT_PUBLIC_API_URL=https://afya-kuu-api.onrender.com"
echo ""
echo "5. 🚀 Deploy and test!"
echo ""
echo "🎉 Your Afya Kuu app will be live at:"
echo "   Frontend: https://afya-kuu-frontend.onrender.com"
echo "   API: https://afya-kuu-api.onrender.com"
