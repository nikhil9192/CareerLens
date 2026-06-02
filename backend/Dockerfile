FROM node:22-bookworm-slim

WORKDIR /app

# System Chromium for PDF generation
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-core \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package*.json ./
# Install all deps (including typescript devDependency) for the build step
RUN npm ci

COPY . .
RUN npm run build

# Remove devDependencies after compile to keep the image smaller
RUN npm prune --omit=dev

ENV NODE_ENV=production

EXPOSE 8000

CMD ["npm", "start"]
