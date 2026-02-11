# Rules

- 1. After each large change run smoke tests for regressions using this command.
     /Users/future/Documents/work/exchange/tests/smoke_tests.sh

- 2. Any DB query should be with this DB
  - export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/open-exchange-dev
