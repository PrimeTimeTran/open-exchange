#!/usr/bin/env python3
import sys
import re

# ANSI colors
RESET = "\033[0m"
BOLD = "\033[1m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
CYAN = "\033[36m"
GRAY = "\033[90m"

def format_test_status(test_name, status):
    # Calculate padding needed
    pad_len = 60 - len(test_name)
    if pad_len < 2:
        pad_len = 2
    
    padding = "." * pad_len
    
    if status == "ok" or status == "PASS":
        status_colored = f"{GREEN}ok{RESET}"
    elif status == "FAILED" or status == "FAIL":
        status_colored = f"{BOLD}{RED}FAILED{RESET}"
    else:
        status_colored = f"{YELLOW}{status}{RESET}"
        
    return f"  • {test_name} {GRAY}{padding}{RESET} {status_colored}"

def format_line(line):
    line = line.rstrip()
    
    # --- RUST HANDLERS ---
    
    # 1. Handle "Running tests/..."
    match_running = re.match(r"^\s*Running (.*?) \.\.\.$", line)
    if match_running:
        path = match_running.group(1)
        return f"\n{BOLD}{BLUE}📂 Running Suite: {path}{RESET}"

    # 2. Handle "test test_name ... ok"
    match_test = re.match(r"^test (.*?) \.\.\. (ok|FAILED|ignored)$", line)
    if match_test:
        test_name = match_test.group(1)
        status = match_test.group(2)
        return format_test_status(test_name, status)

    # 3. Handle "running X tests"
    match_running_count = re.match(r"^running (\d+) tests$", line)
    if match_running_count:
        return f"{GRAY}Running {match_running_count.group(1)} tests...{RESET}"

    # 4. Handle "test result: ..."
    if line.startswith("test result:"):
        if "FAILED" in line or "failed; 0" not in line: 
             color = RED
        else:
             color = GREEN
        return f"{BOLD}{color}{line}{RESET}\n"
    
    # 5. Handle "failures:" section
    if line == "failures:":
        return f"\n{BOLD}{RED}FAILURES:{RESET}"

    # --- GO HANDLERS ---
    
    # 6. Handle Go Package check "Checking Matching Service..." (from smoke_tests.sh echo)
    match_go_no_tests = re.match(r"^\? \s+(.*?)\s+\[no test files\]", line)
    if match_go_no_tests:
        pkg = match_go_no_tests.group(1)
        return f"{GRAY}  • {pkg} (no tests){RESET}"

    # 7. Handle "=== RUN TestName" -> Filter out or Dim?
    if line.startswith("=== RUN"):
        return "" # Hide RUN lines to reduce noise

    # 8. Handle "--- PASS: TestName (0.00s)" or FAIL/SKIP
    match_go_status = re.match(r"^\s*--- (PASS|FAIL|SKIP): (.*?) \(.*\)$", line)
    if match_go_status:
        status_raw = match_go_status.group(1)
        test_name = match_go_status.group(2).strip()
        
        return format_test_status(test_name, status_raw)

    # 9. Handle Go Log lines (Date/Time prefixed)
    # 2026/02/13 20:35:45 ...
    if re.match(r"^\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}", line):
        return f"{GRAY}    {line}{RESET}" # Indent and gray out logs

    # 10. Handle "ok package_name (cached)" or "FAIL package_name" summary lines
    match_go_summary = re.match(r"^(ok|FAIL)\s+(.*?)\s+(.*)$", line)
    if match_go_summary:
        status = match_go_summary.group(1)
        pkg = match_go_summary.group(2)
        rest = match_go_summary.group(3)
        if status == "ok":
            return f"{BOLD}{GREEN}✅ {pkg} {rest}{RESET}"
        else:
            return f"{BOLD}{RED}❌ {pkg} {rest}{RESET}"

    return line

def main():
    for line in sys.stdin:
        formatted = format_line(line)
        if formatted: # Only print if not empty string (filtered)
            print(formatted)

if __name__ == "__main__":
    main()
