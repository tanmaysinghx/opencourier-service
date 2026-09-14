# Stage 1: Build Angular Client
FROM node:24-alpine AS client-build
WORKDIR /app/opencourier-client
COPY opencourier-client/package*.json ./
RUN npm ci
COPY opencourier-client ./
RUN npm run build

# Stage 2: Build Spring Boot Server with Gradle
FROM eclipse-temurin:25-jdk-alpine AS server-build
WORKDIR /app
COPY opencourier-server/gradle ./opencourier-server/gradle
COPY opencourier-server/gradlew opencourier-server/build.gradle opencourier-server/settings.gradle ./opencourier-server/
COPY opencourier-server/src ./opencourier-server/src
COPY --from=client-build /app/opencourier-client/dist /app/opencourier-client/dist
RUN cd opencourier-server && ./gradlew bootJar -x test

# Stage 3: Final Runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=server-build /app/opencourier-server/build/libs/opencourier.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar", "--httpPort=8081"]
