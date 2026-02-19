# Stage 1: Build the JAR using Maven and JDK 21
# Changed from 17 to 21
FROM maven:3.9.6-eclipse-temurin-21 AS build 
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR using JRE 21
# Changed from 17 to 21
FROM eclipse-temurin:21-jre 
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
