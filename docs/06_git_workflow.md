# 6. Документация по процессу работы с Git

## Стратегия ветвления
В проекте используется адаптированная стратегия ветвления Feature Branch Workflow:

| Ветка | Назначение | Базовая ветка |
|---|---|---|
| `main` | Стабильная версия проекта | — |
| `docs/requirements` | Работа над документацией требований | `main` |
| `docs/design` | Проектная документация | `main` |
| `feature/prototype` | Разработка функционального прототипа | `main` |
| `release/v1.0` | Подготовка к публикации | `main` |

## Базовый алгоритм работы
1. Для каждой новой задачи создается отдельная ветка от `main`.
2. После завершения работы ветка сливается в `main` через merge.
3. История коммитов должна быть чистой и понятной.

## Команды настройки рабочего окружения
```bash
git config user.name "GoldenDanOFF"
git config user.email "143820234+GoldenDanOFF@users.noreply.github.com"
```

## Команды инициализации и публикации
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/GoldenDanOFF/contract-control-is.git
git branch -M main
git push -u origin main
```
