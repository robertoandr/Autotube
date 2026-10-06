# ---- build ----
FROM node:22-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./
EXPOSE 8080
CMD ["node", "server.js"]
