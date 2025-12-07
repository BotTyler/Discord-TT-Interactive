# DND Table Top Interactive

## About

A clean, easy-to-use app that helps players and DMs manage their D&D sessions.

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

## Cloudflare Tunnel

Both the frontend and backend should be up and running separately. The cloudflared links will be used within [discord developer](https://discord.com/developers/applications) 'URL Mappings' tab.

| Prefix    | Target                       |
| --------- | ---------------------------- |
| /         | \<Frontend-cloudflared-url\> |
| /colyseus | \<Backend-cloudflared-url\>  |

```YAML
version: "3.3"

networks:
  DndNetwork:
    external: true
services:
  # Cloudflare Tunnel service
  cloudflared-dev-frontend:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-dev-frontend
    networks:
      - DndNetwork
    command: tunnel --url http://<ip>:3000 # Points to your application service
    restart: unless-stopped
  cloudflared-dev-backend:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-dev-backend
    networks:
      - DndNetwork
    command: tunnel --url http://<ip>:2567 # Points to your application service
    restart: unless-stopped
```

```bash
$ docker compose -f docker-compose.yml up
```

## Persistence

```YAML
networks:
  DndNetwork:
    external: true
volumes:
  postgres-db:
  miniofiles:
  pgadmin-data:
services:
  postgres-dev:
    image: postgres
    container_name: postgres-dev
    networks:
      - DndNetwork
    restart: always
    environment:
        POSTGRES_PASSWORD: <PASSWORD>
    volumes:
        - postgres-db:/var/lib/postgressql/data
    ports:
        - "5432:5432"
  pgadmin-dev:
    image: dpage/pgadmin4
    container_name: pgadmin-dev
    networks:
      - DndNetwork
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: <EMAIL>
      PGADMIN_DEFAULT_PASSWORD: <PASSWORD>

      PGADMIN_LISTEN_PORT: 80
    volumes:
      - pgadmin-data:/var/lib/pgadmin
    ports:
      - "5050:80"
    depends_on:
      - postgres-dev
  minio:
    image: minio/minio
    container_name: minio
    restart: always
    environment:
      MINIO_ROOT_USER: <MINIO_ROOT>
      MINIO_ROOT_PASSWORD: <MINIO_PASSWORD>
    ports:
      - "9000:9000"
      - "9001:9001"
    command: server /data --console-address ":9001"
    volumes:
      - miniofiles:/data
    networks:
      - DndNetwork
```

```bash
$ docker compose -f docker-compose.yml up
```

### Database (Postgress and PGAdmin)

1. Go to port [5050](http://localhost:5050) and login.
2. Add the postgres server (PostgressDb is on port 5432). You will need the username and password set in the [Persistence](#Persistence) section.
3. Add a '**postgres**' user (Super user with all perms)
4. Add a '**dnd-prod-user**' user (Super user with all perms)
5. Make a database called '**dnd-prod**'.
6. Restore from [this]() file

### Minio

1. Take note of the username and password set in the [Persistence](#Persistence) section. This will be used as an environment variable in the Backend section.
2. Go to port [9001](http://localhost:9001)
3. Create a bucket named '**dev**'
