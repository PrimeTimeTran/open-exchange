#!/bin/bash
# Remove set -e so we can run all tests and report failures at the end
# set -e

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

# Report Setup
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
# Use absolute path for report file to avoid issues with pushd/popd
REPORT_FILE="$PROJECT_ROOT/tests/tmp/report-${TIMESTAMP}.csv"
touch "$REPORT_FILE"

echo -e "${BOLD}💓 Pulse Check: Starting System Verification...${NC}"
echo "Running from: $(pwd)"
echo "Generating report: $REPORT_FILE"

# Global failure flag
ANY_FAILED=0

# Helper function to run tests
run_service_test() {
    service_name=$1
    service_path=$2
    test_command=$3
    type=$4 # "go", "rust", "node"

    echo -e "\n${BOLD}📦 Checking $service_name...${NC}"
    
    # Header for the service in CSV
    echo "Service: $service_name" >> "$REPORT_FILE"
    echo "Test Suite,Result,Count" >> "$REPORT_FILE"

    pushd "$service_path" > /dev/null
    
    # Capture output. We use || true to prevent set -e from killing it (if it were on) 
    # and to ensure the assignment works even on failure.
    OUTPUT=$(eval "$test_command" 2>&1)
    EXIT_CODE=$?
    
    echo "$OUTPUT"

    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ $service_name Tests Passed${NC}"
        RESULT="Passed"
    else
        echo -e "${RED}❌ $service_name Tests Failed${NC}"
        RESULT="Failed"
        ANY_FAILED=1
    fi

    # Parse and Log to CSV
    if [ "$type" == "go" ]; then
        # Count '--- PASS:' lines for individual tests (requires -v)
        PASS_COUNT=$(echo "$OUTPUT" | grep -c "\-\-\- PASS:")
        FAIL_COUNT=$(echo "$OUTPUT" | grep -c "\-\-\- FAIL:")
        echo "Go Tests,$RESULT,Passed: $PASS_COUNT / Failed: $FAIL_COUNT" >> "$REPORT_FILE"
    elif [ "$type" == "rust" ]; then
        SUMMARY_LINE=$(echo "$OUTPUT" | grep "test result:")
        PASS_COUNT=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ passed' | awk '{sum+=$1} END {print sum}')
        FAIL_COUNT=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ failed' | awk '{sum+=$1} END {print sum}')
        echo "Rust Tests,$RESULT,Passed: ${PASS_COUNT:-0} / Failed: ${FAIL_COUNT:-0}" >> "$REPORT_FILE"
    elif [ "$type" == "node" ]; then
        SUMMARY_LINE=$(echo "$OUTPUT" | grep "Tests:")
        PASS_COUNT=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ passed' | awk '{print $1}')
        TOTAL_COUNT=$(echo "$SUMMARY_LINE" | grep -oE '[0-9]+ total' | awk '{print $1}')
        echo "Jest Tests,$RESULT,Passed: ${PASS_COUNT:-0} / Total: ${TOTAL_COUNT:-0}" >> "$REPORT_FILE"
    else
        echo "Unknown,$RESULT,N/A" >> "$REPORT_FILE"
    fi

    # Add spacing line
    echo "" >> "$REPORT_FILE"

    popd > /dev/null
}

# 1. Matching Service (Go)
run_service_test "Matching Service" "services/matching" "go test -v \$(go list ./... | grep -v /proto/)" "go"

# 2. Market Service (Go)
run_service_test "Market Service" "services/market" "go test -v \$(go list ./... | grep -v /proto/)" "go"

# 3. Ledger Service (Rust)
run_service_test "Ledger Service" "services/ledger" "cargo test" "rust"

# 4. Client Service (Node.js)
if [ ! -d "services/client/node_modules" ]; then
    echo -e "\n⚠️  Client service node_modules not found. Installing dependencies..."
    pushd "services/client" > /dev/null
    npm install
    popd > /dev/null
fi
run_service_test "Client Service" "services/client" "npm run test" "node"


if [ $ANY_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}${BOLD}🎉 Pulse Check Complete: All Service Unit Tests Passed!${NC}"
else
    echo -e "\n${RED}${BOLD}💔 Pulse Check Complete: Some Tests Failed.${NC}"
    echo -e "Check the report for details: $REPORT_FILE"
    exit 1
fi

echo -e "Report generated at: $PROJECT_ROOT/$REPORT_FILE"
echo -e "To run E2E tests, ensure environment is running and execute 'npm test' in the tests/ directory."
