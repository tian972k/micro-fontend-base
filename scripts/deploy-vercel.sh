#!/bin/bash

# Vercel Deployment Script
# Usage: bash scripts/deploy-vercel.sh [app-name]
# Example: bash scripts/deploy-vercel.sh shell
#          bash scripts/deploy-vercel.sh app-react
#          bash scripts/deploy-vercel.sh all

set -e

APP=$1
ROOT_DIR=$(pwd)

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Orbit MFE Platform - Vercel Deploy${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to deploy shell (production build on Vercel)
deploy_shell() {
    echo -e "${GREEN}🚀 Deploying Shell (Remix)...${NC}"
    echo -e "${YELLOW}   Build: Vercel remote (Turborepo)${NC}"
    echo ""
    
    cd "$ROOT_DIR/apps/shell"
    vercel --prod
    
    echo -e "${GREEN}✅ Shell deployed!${NC}"
    echo ""
}

# Function to deploy MFE app (use Vercel build)
deploy_mfe() {
    local APP_NAME=$1
    local APP_DIR="$ROOT_DIR/apps/$APP_NAME"
    
    echo -e "${GREEN}🚀 Deploying $APP_NAME...${NC}"
    echo -e "${YELLOW}   Build: Vercel build + deploy${NC}"
    echo ""
    
    # Navigate to app directory
    cd "$APP_DIR"
    
    # Build using Vercel (creates .vercel/output)
    echo -e "${BLUE}📦 Building with Vercel...${NC}"
    vercel build --prod
    
    # Deploy pre-built output
    echo -e "${BLUE}☁️  Deploying to Vercel...${NC}"
    vercel deploy --prebuilt --prod
    
    echo -e "${GREEN}✅ $APP_NAME deployed!${NC}"
    echo ""
}

# Main deployment logic
case "$APP" in
    "shell")
        deploy_shell
        ;;
    "app-react")
        deploy_mfe "app-react"
        ;;
    "app-vue")
        deploy_mfe "app-vue"
        ;;
    "app-svelte")
        deploy_mfe "app-svelte"
        ;;
    "app-solidjs")
        deploy_mfe "app-solidjs"
        ;;
    "app-nextjs")
        echo -e "${GREEN}🚀 Deploying app-nextjs...${NC}"
        echo -e "${YELLOW}   Build: Vercel remote (Next.js)${NC}"
        echo ""
        cd "$ROOT_DIR/apps/app-nextjs"
        vercel --prod
        echo -e "${GREEN}✅ app-nextjs deployed!${NC}"
        echo ""
        ;;
    "all")
        echo -e "${YELLOW}⚡ Deploying ALL apps in sequence...${NC}"
        echo ""
        
        # Deploy MFEs first
        deploy_mfe "app-react"
        deploy_mfe "app-vue"
        deploy_mfe "app-svelte"
        deploy_mfe "app-solidjs"
        
        # Deploy Next.js
        cd "$ROOT_DIR/apps/app-nextjs"
        vercel --prod
        
        # Deploy Shell last (needs MFE URLs)
        echo -e "${YELLOW}⚠️  Remember to set env vars for shell before deploying!${NC}"
        echo -e "${YELLOW}   Go to Vercel Dashboard → Shell project → Settings → Environment Variables${NC}"
        echo ""
        read -p "Press Enter when env vars are set, or Ctrl+C to skip shell deployment..."
        deploy_shell
        
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}   ✅ ALL APPS DEPLOYED SUCCESSFULLY!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown app: $APP${NC}"
        echo ""
        echo "Usage: bash scripts/deploy-vercel.sh [app-name]"
        echo ""
        echo "Available apps:"
        echo "  shell        - Remix shell (gateway)"
        echo "  app-react    - React MFE"
        echo "  app-vue      - Vue MFE"
        echo "  app-svelte   - Svelte MFE"
        echo "  app-solidjs  - SolidJS MFE"
        echo "  app-nextjs   - Next.js MFE"
        echo "  all          - Deploy all apps"
        echo ""
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment complete!${NC}"
