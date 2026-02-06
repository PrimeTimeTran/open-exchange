#

```sh
createdb -h localhost -p 5432 -U postgres scaffoldhub-localhost-app

dropdb -h localhost -p 5432 -U postgres scaffoldhub-localhost-app
```

```sh
npm run setup
npm run prisma:seed:dev
```

```sh
docker-compose up --build
```
