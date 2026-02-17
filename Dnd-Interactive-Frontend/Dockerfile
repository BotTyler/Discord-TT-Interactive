# FROM node:18-alpine3.17 as build
#
# WORKDIR /app
# COPY . .
# RUN npm install
# RUN npm run build
#
# #EXPOSE 4173
# EXPOSE 3000
# CMD ["npm", "run", "dev"]

# -------------------------
# 1) Build React App
# -------------------------
FROM node:25-alpine3.22 AS builder

ARG VITE_CLIENT_ID
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID

WORKDIR /app

# Install dependencies
# COPY package.json package-lock.json ./
COPY Dnd-Interactive-Frontend .

# This is a sym link to the backend repo.
# Keeping this will mess up paths within the build process.
RUN rm src/shared

# Replace the shared folder contents where the sym link was.
COPY Dnd-Interactive-Backend/src/shared ./src/shared

RUN npm ci

# Copy source and build
RUN npm run build

# -------------------------
# 2) Serve With Nginx
# -------------------------
FROM nginx:stable-alpine

# Remove default nginx config and add our own
RUN rm /etc/nginx/conf.d/default.conf
COPY Dnd-Interactive-Frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

