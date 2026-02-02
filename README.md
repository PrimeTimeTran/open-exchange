#

```sh
createdb -h localhost -p 5432 -U postgres scaffoldhub-localhost-app

dropdb -h localhost -p 5432 -U postgres scaffoldhub-localhost-app
```

```sh
npx run setup
```

```sh
$ docker-compose up --build
```
