FROM node:22-bookworm-slim

WORKDIR /app

# System Chromium for PDF generation (Alpine lacks required libraries)
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-core \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
