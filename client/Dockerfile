FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm config set legacy-peer-deps true \
    && npm install \
    && npm install -g @angular/cli

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 4200

ENTRYPOINT ["docker-entrypoint.sh"]
