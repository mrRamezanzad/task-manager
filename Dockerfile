# Stage 1: Build
FROM node:20.11.1-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# Stage 2: develop
FROM node:20.11.1-alpine AS develop
WORKDIR /app
COPY --from=build /app .
CMD ["npm", "start"]