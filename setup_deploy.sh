#!/bin/bash

# Firebase Deployment Setup Script
# Usage: ./setup_deploy.sh <FIREBASE_PROJECT_ID>

PROJECT_ID=$1

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: Please provide a Firebase Project ID."
  echo "Usage: ./setup_deploy.sh <FIREBASE_PROJECT_ID>"
  exit 1
fi

echo "🚀 Setting up Firebase deployment for project: $PROJECT_ID"

# 1. Create firebase.json if it doesn't exist
if [ ! -f "firebase.json" ]; then
  echo "📄 Creating firebase.json..."
  cat > firebase.json <<EOF
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
EOF
else
  echo "⚠️  firebase.json already exists. Skipping."
fi

# 2. Create .firebaserc
echo "📄 Creating .firebaserc..."
cat > .firebaserc <<EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

# 3. Create GitHub Actions Workflow
echo "mb Creating GitHub Actions workflow..."
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml <<EOF
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy_live_website:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '\${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT_KEY }}'
          channelId: live
          projectId: '\${{ secrets.FIREBASE_PROJECT_ID }}'
EOF

# 4. Add .gitignore entry
if [ -f ".gitignore" ]; then
    if ! grep -q "*.json" ".gitignore"; then
        echo "🛡️  Adding *.json to .gitignore to protect secrets..."
        echo "*.json" >> .gitignore
    fi
else
    echo "*.json" > .gitignore
fi

echo "✅ Setup complete!"
echo ""
echo "👉 Next Steps:"
echo "1. Push this code to GitHub: git push"
echo "2. Go to Firebase Console > Project Settings > Service accounts > Generate new private key."
echo "3. Go to GitHub Repo > Settings > Secrets > Actions > New repository secret."
echo "4. Name: FIREBASE_SERVICE_ACCOUNT_KEY"
echo "5. Value: Paste the content of the downloaded JSON key file."
