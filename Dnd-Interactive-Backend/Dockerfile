FROM node:25-alpine3.22

WORKDIR /app

COPY . .
RUN npm install
RUN npm run build
EXPOSE 2567
CMD ["npm", "start"]
