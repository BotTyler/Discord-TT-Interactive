# DND Table Top Interactive

## About

A real-time, Discord-embedded tabletop app built with React, Express, Colyseus, and Docker that streamlines D&D combat for remote campaigns. Players can manage combat, share handouts, and chat seamlessly in a fantasy environment. Designed to bring the tabletop experience to Discord, giving players more control and immersion without needing to meet in person.

## Prerequisites

### Node & NPM

Currently maintained with:
Node: V22.20.0
NPM: 10.9.3

These can be managed with [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

```bash
$ nvm install V22.20.0

# Verify
$ nvm ls
```

## Setup

- [Frontend](./Dnd-Interactive-Frontend/README.md)
- [Backend](./Dnd-Interactive-Backend/README.md)

## Automation

Running and deploying the application is simple thanks to a Docker Compose file that bundles all the configuration needed to get it up and running.

The only requirement is a `.env` file located at [`./automation/`](./automation/).

```.env
# Discord Auth Tokens
VITE_CLIENT_ID=<ID>
CLIENT_SECRET=<SECRET>

#Database
DB_USER=dnd-prod-user
DB_PASSWORD=<PASSWORD>
DB_HOST=<DB_HOST_IP>
DB_PORT=5432
DB_NAME=dnd-prod
POSTGRES_ADMIN_PASSWORD=<ADMIN_PASSWORD>
PGADMIN_EMAIL=<PGADMIN_EMAIL>
PGADMIN_PASSWORD=<PGADMIN_PASSWORD>

#Minio Auth
MINIO_ACCESS_KEY=<MINIO_ACCESS_KEY>
MINIO_SECRET_KEY=<MINIO_SECRET_KEY>
MINIO_ENDPOINT=<MINIO_HOST>
MINIO_PORT=9000

#MINIO BUCKET INFORMATION
MINIO_BUCKET=dev

# JWT authentication secret (Random String)
JWT_SECRET=<honestly, slam head into keyboard>
```

```bash
docker compose up -d --build
```

### Database (Postgress and PGAdmin)

1. Go to port [5050](http://localhost:5050) and login.
2. Add the postgres server (PostgressDb is on port 5432). You will need the username and password set in the [Persistence](#Persistence) section.
3. Add a '**postgres**' user (Super user with all perms)
4. Add a '**dnd-prod-user**' user (Super user with all perms)
5. Make a database called '**dnd-prod**'.
6. Restore from [this](./DND-SQL-Tables.sql) file

### Minio

1. Take note of the username and password set in the [Persistence](#Persistence) section. This will be used as an environment variable in the Backend section.
2. Go to port [9001](http://localhost:9001)
3. Create a bucket named '**dev**'
