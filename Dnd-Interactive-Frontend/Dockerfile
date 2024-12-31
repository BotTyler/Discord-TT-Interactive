FROM node:18-alpine3.17 as build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

#EXPOSE 4173
EXPOSE 3000
CMD ["npm", "run", "dev"]