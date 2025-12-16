# Disbalanced

Trading platform for cryptocurrency market depth analysis.

## Stack

- **Frontend:** Next.js 14, TradingView Charting Library, Tailwind CSS
- **Backend:** .NET 9, ASP.NET Core
- **Database:** PostgreSQL + TimescaleDB
- **Infrastructure:** Docker, Docker Compose

## Quick Start

```bash
# Clone repository
git clone git@github.com:HRV220/Disbalanced.git
cd Disbalanced

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │───▶│  CoinService │───▶│  PostgreSQL  │
│   (Next.js)  │    │    (.NET)    │    │ (TimescaleDB)│
│   :3000      │    │    :5000     │    │   :5432      │
└──────────────┘    └──────────────┘    └──────────────┘
```
