# CoinService - Сервис сбора данных криптовалютного рынка

Микросервис для сбора и хранения метрик криптовалютного рынка с использованием CoinAPI и TimescaleDB.

## Технологии

- **.NET 9.0** - Платформа разработки
- **PostgreSQL + TimescaleDB** - База данных для временных рядов
- **Entity Framework Core** - ORM
- **CoinAPI** - Источник рыночных данных
- **Docker & Docker Compose** - Контейнеризация

## Структура проекта

```
CoinService/
├── CoinService/              # Основное приложение
│   ├── Data/                 # DbContext и модели
│   ├── Services/             # Бизнес-логика
│   ├── Workers/              # Фоновые службы
│   ├── Configuration/        # Конфигурация
│   └── Dockerfile           # Docker образ приложения
├── APIBricks.CoinAPI.*/     # SDK для CoinAPI
├── docker-compose.yml        # Оркестрация контейнеров
├── .env.example             # Шаблон переменных окружения
└── README.md                # Документация
```

## Быстрый старт

### Предварительные требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0) (для локальной разработки)
- API ключ от [CoinAPI](https://www.coinapi.io/)

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd CoinService
```

### 2. Настройка переменных окружения

```bash
# Скопировать шаблон
cp .env.example .env

# Отредактировать .env и указать ваш COINAPI_KEY
# Также можете изменить пароли и другие настройки
```

**Важно:** Обязательно укажите ваш настоящий ключ CoinAPI в переменной `COINAPI_KEY`

### 3. Запуск через Docker Compose

```bash
# Запустить все сервисы (PostgreSQL + CoinService)
docker-compose up -d

# Проверить логи
docker-compose logs -f coinservice

# Остановить сервисы
docker-compose down

# Остановить и удалить volumes (удалит все данные БД!)
docker-compose down -v
```

### 4. Доступ к сервисам

- **CoinService API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **PostgreSQL**: localhost:5432
  - Database: `coin_market_data`
  - User: `postgres`
  - Password: (из `.env`)

## Локальная разработка (без Docker)

### 1. Запустить только PostgreSQL

```bash
docker-compose up -d postgres
```

### 2. Настроить переменные окружения

Отредактируйте `CoinService/appsettings.Development.json` или используйте User Secrets:

```bash
cd CoinService
dotnet user-secrets set "CoinApi:Key" "YOUR_COINAPI_KEY"
```

### 3. Запустить приложение

```bash
cd CoinService
dotnet run
```

## Конфигурация

### Переменные окружения (.env)

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `POSTGRES_DB` | Имя базы данных | `coin_market_data` |
| `POSTGRES_USER` | Пользователь БД | `postgres` |
| `POSTGRES_PASSWORD` | Пароль БД | `postgres123` |
| `COINAPI_KEY` | API ключ CoinAPI | - |
| `COLLECTOR_INTERVAL_MINUTES` | Интервал сбора данных | `1` |
| `COLLECTOR_PARALLELISM` | Степень параллелизма | `10` |
| `COLLECTOR_TOP_PAIRS` | Кол-во отслеживаемых пар | `100` |

### Настройки сборщика данных

Настройки можно изменить в `.env` или `appsettings.json`:

```json
{
  "DataCollector": {
    "CollectionIntervalMinutes": 1,
    "MaxDegreeOfParallelism": 10,
    "TopPairsCount": 100,
    "OrderBookLimitLevels": 0,
    "SymbolsRefreshIntervalHours": 24
  }
}
```

## Работа с базой данных

### Подключение к PostgreSQL

```bash
# Через docker-compose
docker-compose exec postgres psql -U postgres -d coin_market_data

# Напрямую
psql -h localhost -p 5432 -U postgres -d coin_market_data
```

### Полезные SQL команды

```sql
-- Проверить расширение TimescaleDB
SELECT * FROM pg_extension WHERE extname = 'timescaledb';

-- Проверить hypertables
SELECT * FROM timescaledb_information.hypertables;

-- Посмотреть последние метрики
SELECT * FROM market_metrics ORDER BY time DESC LIMIT 10;

-- Статистика по символам
SELECT symbol, COUNT(*), MIN(time), MAX(time)
FROM market_metrics
GROUP BY symbol;
```

## Деплой на продакшен

### 1. Подготовка

```bash
# Обновить .env для продакшена
cp .env.example .env.production

# Изменить:
# - ASPNETCORE_ENVIRONMENT=Production
# - Установить надежные пароли
# - Указать реальный COINAPI_KEY
```

### 2. Запуск на сервере

```bash
# Загрузить проект на сервер
scp -r CoinService/ user@server:/opt/

# Подключиться к серверу
ssh user@server

# Перейти в директорию
cd /opt/CoinService

# Запустить
docker-compose -f docker-compose.yml --env-file .env.production up -d
```

## Мониторинг и логи

```bash
# Просмотр логов всех сервисов
docker-compose logs -f

# Логи только приложения
docker-compose logs -f coinservice

# Логи PostgreSQL
docker-compose logs -f postgres

# Статус контейнеров
docker-compose ps
```

## Проблемы и решения

### Приложение не может подключиться к БД

1. Проверьте, что PostgreSQL запущен: `docker-compose ps`
2. Проверьте логи БД: `docker-compose logs postgres`
3. Проверьте переменные окружения в `.env`

### TimescaleDB расширение не установлено

Образ `timescale/timescaledb:latest-pg16` уже включает расширение. При первом запуске приложение автоматически создаст hypertable.

### Ошибка "API Key не найден"

Убедитесь, что в `.env` указан `COINAPI_KEY` и файл загружен в docker-compose.

## API Endpoints

### Health Check

```bash
GET http://localhost:5000/health
```

### Swagger UI

```bash
http://localhost:5000/swagger
```

## Лицензия

MIT

## Контакты

Для вопросов и предложений создавайте Issues в репозитории.
