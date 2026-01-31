FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 👇 Expo env must be injected at BUILD TIME
ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

EXPOSE 8081

# 👇 correct command for Expo Web
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
