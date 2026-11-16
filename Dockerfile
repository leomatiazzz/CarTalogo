# syntax=docker/dockerfile:1

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["API/minimal-api.csproj", "API/"]
RUN dotnet restore "API/minimal-api.csproj"

# Copy remaining source code and build
COPY API/ API/
WORKDIR "/src/API"
RUN dotnet publish "minimal-api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# Run as non-root user for security
USER $APP_UID

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "minimal-api.dll"]
