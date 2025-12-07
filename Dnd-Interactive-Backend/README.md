# Backend

## About

> [!NOTE]
> This backend cannot run normally in the browser as the DiscordSDK is being used. Therefore, make sure the cloudflared links and app are setup in [discord developer](https://discord.com/developers/applications). The access the application via the activities section.

ExpressJS backend utilizing colyseus for multiplayer interactions.

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

### Environment

Make sure to fill out anything surrounded by \<\>. These can be setup by configuring each of the persistent storages.

```Environment
# Discord Auth Tokens
VITE_CLIENT_ID=<Discord_Client_id>
CLIENT_SECRET=<Discord_Client_Secret>

#Database
DB_USER=dnd-prod-user
DB_PASSWORD=<DB_Password>
DB_HOST=<DB_IP>
DB_PORT=5432
DB_NAME=dnd-prod

#Minio Auth
MINIO_ACCESS_KEY=<MINIO_ACCESS>
MINIO_SECRET_KEY=<MINIO_SECRET>
MINIO_ENDPOINT=<MINIO_IP>
MINIO_PORT=9000

#MINIO BUCKET INFORMATION
MINIO_BUCKET=dev

# JWT authentication secret (Random String)
JWT_SECRET=<Random_String>
```

## Post Setup

Install the dependencies.

```bash
$ npm install
```

Start the service with:

```bash
$ npm run dev
```
