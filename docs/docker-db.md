```sh
createdb -h localhost -U postgres open-exchange-dev
createdb -h localhost -U postgres open-exchange-test


dropdb -h localhost -p 5432 -U postgres open-exchange-dev
dropdb -h localhost -p 5432 -U postgres open-exchange-test
```

```sh
POSTGRES_DB=open-exchange-dev docker compose up
POSTGRES_HOST=open-exchange-test POSTGRES_DB=open-exchange-test docker compose up
```

