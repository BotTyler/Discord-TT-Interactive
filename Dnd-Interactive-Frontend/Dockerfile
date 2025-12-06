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
FROM node:18-alpine3.17 AS builder

WORKDIR /app

# Install dependencies
# COPY package.json package-lock.json ./
COPY . .
RUN npm ci

# Copy source and build
RUN npm run build

# -------------------------
# 2) Serve With Nginx
# -------------------------
FROM nginx:stable-alpine

# Remove default nginx config and add our own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

