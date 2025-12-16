FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["CoinService/CoinService.csproj", "CoinService/"]
COPY ["APIBricks.CoinAPI.MarketDataAPI.REST.V1/APIBricks.CoinAPI.MarketDataAPI.REST.V1.csproj", "APIBricks.CoinAPI.MarketDataAPI.REST.V1/"]

RUN dotnet restore "CoinService/CoinService.csproj"

COPY . .

WORKDIR "/src/CoinService"
RUN dotnet build "CoinService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CoinService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

RUN mkdir -p /app/logs

COPY --from=publish /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "CoinService.dll"]