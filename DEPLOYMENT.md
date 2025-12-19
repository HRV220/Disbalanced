# Deployment Guide

## Сервер
- IP: `147.45.109.121`
- Путь проекта: `/opt/Disbalanced`
- Пользователь: `root`

## Подключение к серверу

```bash
ssh root@147.45.109.121
cd /opt/Disbalanced
```

## Команды деплоя

### 1. Получить изменения из репозитория
```bash
git pull
```

### 2. Запуск всех контейнеров
```bash
docker-compose -f docker-compose.production.yml up -d
```

### 3. Запуск с пересборкой образов
```bash
docker-compose -f docker-compose.production.yml up -d --build
```

### 4. Остановка всех контейнеров
```bash
docker-compose -f docker-compose.production.yml down
```

### 5. Полный редеплой (остановка + пересборка + запуск)
```bash
docker-compose -f docker-compose.production.yml down && docker-compose -f docker-compose.production.yml up -d --build
```

### 6. Пересборка только frontend
```bash
docker-compose -f docker-compose.production.yml up -d --build --no-deps frontend
```

### 7. Пересборка только backend
```bash
docker-compose -f docker-compose.production.yml up -d --build --no-deps coinservice
```

## Мониторинг

### Статус контейнеров
```bash
docker-compose -f docker-compose.production.yml ps
```

### Логи всех сервисов
```bash
docker-compose -f docker-compose.production.yml logs -f
```

### Логи конкретного сервиса
```bash
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f coinservice
docker-compose -f docker-compose.production.yml logs -f postgres
```

### Последние N строк логов
```bash
docker-compose -f docker-compose.production.yml logs --tail 100 coinservice
```

## Доступ к приложению

| Сервис | URL |
|--------|-----|
| Frontend | http://147.45.109.121:3000 |
| Backend API | http://147.45.109.121:5000 |
| Health check | http://147.45.109.121:5000/health |

## Переменные окружения

Файл `.env` в `/opt/Disbalanced`:

```env
# PostgreSQL
POSTGRES_PASSWORD=postgres123

# CoinAPI
COINAPI_KEY=ваш_ключ_api

# Frontend
NEXT_PUBLIC_API_URL=http://147.45.109.121:5000
```

## Troubleshooting

### Контейнер unhealthy
```bash
# Проверить логи
docker logs --tail 50 coinservice_app
docker logs --tail 50 tradingview_frontend

# Проверить healthcheck
curl http://localhost:5000/health
curl http://localhost:3000
```

### SSH обрывается при долгой сборке
Используй `screen` или `tmux`:
```bash
screen -S deploy
docker-compose -f docker-compose.production.yml up -d --build
# Ctrl+A, D - отключиться от screen
# screen -r deploy - вернуться
```

### Очистка Docker (освободить место)
```bash
docker system prune -a
```
