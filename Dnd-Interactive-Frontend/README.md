# Frontend

## About

> [!NOTE]
> This frontend cannot run normally in the browser as the DiscordSDK is being used. Therefore, make sure the cloudflared links and app are setup in [discord developer](https://discord.com/developers/applications). The access the application via the activities section.

A frontend utilizing react and React Leaflet for multiplayer map interactions.

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
