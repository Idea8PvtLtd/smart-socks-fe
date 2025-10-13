# Build stage
FROM node:20-alpine AS build

ARG VITE_APP_ENV
ENV VITE_APP_ENV=$VITE_APP_ENV

# Set the working directory.
WORKDIR /app

# Copy the package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM python:3.12-slim AS production

WORKDIR /app

ENV PYTHONUNBUFFERED=1

# Install system packages (nginx + bash for entrypoint script)
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx bash \
    && rm -rf /var/lib/apt/lists/*

# Copy frontend build output to nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Prepare backend config and data directories
RUN mkdir -p /app/config /app/data
COPY --from=build /app/src/Jsons/DbJson/Wearers.json /app/config/Wearers.json

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Copy backend sources
COPY Backend ./Backend

# Install Python dependencies for the backend
RUN pip install --no-cache-dir python-dotenv

# Copy entrypoint script to launch both services
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
