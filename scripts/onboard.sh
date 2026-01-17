#!/bin/bash

# Micro-Frontend Platform Onboarding Check
# Checks for required tools and versions

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Environment Verification...${NC}"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
else
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt "18" ]; then
        echo -e "${YELLOW}⚠️  Node.js version is a bit old (v$(node -v)). Recommended: v18+ for best compatibility.${NC}"
    else
        echo -e "${GREEN}✅ Node.js $(node -v) is installed.${NC}"
    fi
fi

# 2. Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed. Run: npm install -g pnpm${NC}"
else
    echo -e "${GREEN}✅ pnpm v$(pnpm -v) is installed.${NC}"
fi

# 3. Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. You won't be able to run production simulations.${NC}"
else
    echo -e "${GREEN}✅ Docker is installed.${NC}"
fi

# 4. Check .env file
if [ ! -f "apps/shell/.env" ]; then
    echo -e "${YELLOW}⚠️  apps/shell/.env missing. Creating from example...${NC}"
    cp apps/shell/.env.example apps/shell/.env
    echo -e "${GREEN}✅ .env file created.${NC}"
fi

# 5. Check dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 node_modules missing. Recommended: Run 'pnpm install'${NC}"
fi

echo -e "\n${BLUE}Verification Complete!${NC}"
