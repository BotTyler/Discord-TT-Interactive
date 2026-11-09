FROM node:24-alpine

WORKDIR /app
COPY verifier.js .

# Run as the unprivileged user that ships with the node image
USER node

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/healthz || exit 1

CMD ["node", "verifier.js"]
