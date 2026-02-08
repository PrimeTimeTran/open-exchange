#!/bin/bash
set -e

# Resolve the directory where the script is located to ensure paths work regardless of where it's called from
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

# Move to project root
cd "$PROJECT_ROOT"

# ANSI color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BOLD}💓 Pulse Check: Starting System Verification...${NC}"
echo "Running from: $(pwd)"

# Helper function to run tests
run_service_test() {
    service_name=$1
    service_path=$2
    test_command=$3

    echo -e "\n${BOLD}📦 Checking $service_name...${NC}"
    pushd "$service_path" > /dev/null
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ $service_name Tests Passed${NC}"
    else
        echo -e "${RED}❌ $service_name Tests Failed${NC}"
        exit 1
    fi
    popd > /dev/null
}

# 1. Matching Service (Go)
run_service_test "Matching Service" "services/matching" "go test \$(go list ./... | grep -v /proto/)"

# 2. Market Service (Go)
run_service_test "Market Service" "services/market" "go test \$(go list ./... | grep -v /proto/)"

# 3. Ledger Service (Rust)
run_service_test "Ledger Service" "services/ledger" "cargo test"

# 4. Client Service (Node.js)
# Check if node_modules exists, simple check
if [ ! -d "services/client/node_modules" ]; then
    echo -e "\n⚠️  Client service node_modules not found. Installing dependencies..."
    pushd "services/client" > /dev/null
    npm install
    popd > /dev/null
fi
run_service_test "Client Service" "services/client" "npm run test"


echo -e "\n${GREEN}${BOLD}🎉 Pulse Check Complete: All Service Unit Tests Passed!${NC}"
echo -e "To run E2E tests, ensure environment is running and execute 'npm test' in the tests/ directory."
