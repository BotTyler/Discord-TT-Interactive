FROM node:25-alpine3.22

WORKDIR /app

COPY . .
RUN npm install && npm run build
EXPOSE 2567

ENV NODE_ENV=production
ENV LOG_DIR=/app/logs

RUN mkdir -p /app/logs

CMD ["npm", "start"]
