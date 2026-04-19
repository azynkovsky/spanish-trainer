# Spanish Trainer Web Release

Готовая структура проекта для локального запуска и деплоя на Vercel / Netlify.

## Быстрый старт

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Что важно
- Прогресс хранится в localStorage браузера
- CSV загружаются через интерфейс
- Для переноса прогресса между устройствами используй экспорт / импорт JSON

## Файлы, которые можно сразу загружать в приложение
- topics.csv
- blocks.csv
- block_items.csv
- vocabulary.csv
- grammar_tasks.csv
- open_tasks.csv

## Публикация на Vercel
1. Загрузить проект в GitHub
2. Создать новый проект на Vercel
3. Подключить репозиторий
4. Build command: `npm run build`
5. Output directory: `dist`


## Встроенная библиотека
Проект автоматически подхватывает CSV из папки `public/data/`:
- `topics.csv`
- `blocks.csv`
- `block_items.csv`
- `vocabulary.csv`
- `grammar_tasks.csv`
- `open_tasks.csv`

После деплоя эти файлы будут доступны всем устройствам без ручной загрузки.
Ручной импорт через интерфейс остаётся как запасной вариант.
