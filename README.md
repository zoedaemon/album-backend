# Album Backend


## Build & Run  (Dev)
Full development REST API for frontend  [investax-album](https://github.com/alex-solovev/investax-album); With sequelize & postgresql, jest & supertest   

do this for install all package
```sh
$ npm install
```
then run with docker-compose for running postgresql in docker
```sh
$ docker-compose -f deploy/docker-compose.yml up -d 
``` 
run project with 
```sh
$ npm start
```
## Test 
just run test unit and see all coverage
```sh
npm test
```

## Milestone
- [x] Base project skeleton
- [x] Unit testing with Jest & Supertest
- [x] Sequelize connected to Postgresql
- [x] Migration & Seeding before test unit running
- [x] GET /health ; Simple Health Check (CPU percentage usage : WARN if > 50%)
- [x] POST /photos/list
- [x] PUT /photos ; single or multiple parallel images upload
- [x] GET /photos/{{Album}}/{{FileName}} ; get single raw image 
- [ ] GET /photos/{{Album}}/{{FileName}} ; delete single photos
- [ ] GET /photos ; delete multiple photos
- [ ] Embeded swagger documentation
- [ ] Modular validator Celebrate & Joy
