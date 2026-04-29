FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["SmaStamaFeedbackHub.WebAPI/SmaStamaFeedbackHub.WebAPI.csproj", "SmaStamaFeedbackHub.WebAPI/"]
COPY ["SmaStamaFeedbackHub.Infrastructure/SmaStamaFeedbackHub.Infrastructure.csproj", "SmaStamaFeedbackHub.Infrastructure/"]
COPY ["SmaStamaFeedbackHub.Entities/SmaStamaFeedbackHub.Entities.csproj", "SmaStamaFeedbackHub.Entities/"]
COPY ["SmaStamaFeedbackHub.Commons/SmaStamaFeedbackHub.Commons.csproj", "SmaStamaFeedbackHub.Commons/"]
COPY ["SmaStamaFeedbackHub.Contracts/SmaStamaFeedbackHub.Contracts.csproj", "SmaStamaFeedbackHub.Contracts/"]

RUN dotnet restore "SmaStamaFeedbackHub.WebAPI/SmaStamaFeedbackHub.WebAPI.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/SmaStamaFeedbackHub.WebAPI"
RUN dotnet build "SmaStamaFeedbackHub.WebAPI.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "SmaStamaFeedbackHub.WebAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "SmaStamaFeedbackHub.WebAPI.dll"]
