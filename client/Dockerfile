FROM node:20-alpine

WORKDIR /app

# Copy package.json to install dependencies in the image
COPY package*.json ./
RUN npm config set legacy-peer-deps true
RUN npm install
RUN npm install -g @angular/cli

# Expose port
EXPOSE 4200

# Start Angular app bound to all interfaces
CMD ["ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
