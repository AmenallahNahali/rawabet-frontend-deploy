# =========================
# Stage 1: Build Angular
# =========================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


# =========================
# Stage 2: Serve Angular with Nginx
# =========================
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/hello-claude/browser /usr/share/nginx/html

RUN rm -f /usr/share/nginx/html/index.html && \
    mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]