# Setup — Как запустить проект

Есть **два режима запуска**: (1) просмотр прототипа как есть, (2) начало разработки production-версии.

---

## 1) Просмотр интерактивного прототипа (без установки npm)

Прототип — это статический HTML с Babel inline JSX, работает **без сборки**.

```bash
# Любой статический сервер, например:
npx serve . --listen 5174
# или
python -m http.server 8000
```

Открыть в браузере: `http://localhost:5174/Step 3 - Prototype.html`

Работает с любого http-сервера, потому что `.jsx`-файлы подключаются относительными путями.

---

## 2) Разработка production-версии (React + Vite + TypeScript)

### Требования
- **Node.js** ≥ 20.0.0
- **npm** ≥ 10 (или pnpm / yarn)

### Установка и запуск
```bash
npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`. HMR включён.

### Основные скрипты
| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер с HMR на порту 5173 |
| `npm run build` | Production-сборка в `dist/` (сначала tsc проверяет типы) |
| `npm run preview` | Локальный просмотр production-сборки |
| `npm run typecheck` | Проверка TypeScript-типов без сборки |
| `npm run lint` | ESLint по всему `src/` |
| `npm run format` | Prettier автоформатирование |
| `npm run test` | Vitest unit-тесты |
| `npm run prototype` | Запуск оригинального HTML-прототипа на порту 5174 |

### Структура папок
```
├── index.html                 ← Vite entry (production)
├── package.json
├── vite.config.ts
├── tsconfig.json + tsconfig.node.json
├── .eslintrc.cjs
├── .prettierrc.json
├── .gitignore
│
├── src/                       ← Ваш production-код (напишете здесь)
│   ├── main.tsx               точка входа с QueryClient + Router
│   ├── App.tsx                роутинг (сейчас заглушки экранов)
│   └── vite-env.d.ts
│
├── tokens.css                 ← Design tokens (используется как есть в index.html)
├── components.css             ← BEM-стили (используется как есть или мигрируется в CSS Modules)
│
├── app/                       ← Референс-прототип (JSX + Babel inline)
├── Step 1 - Audit.html        ← Аналитика легаси и принципы
├── Step 2 - UI Kit.html       ← Showroom компонентов
├── Step 3 - Prototype.html    ← Живой прототип всех экранов
│
├── brand/eae_logo.png
├── legacy/                    ← Скриншоты старого UI (для сравнения)
└── README.md                  ← Полная спецификация всех экранов
```

### План разработки (по спринтам)
См. секцию «Приоритеты для разработки» в `README.md`:
1. Foundation — токены, Button/Input/Select/Card, Sidebar/Topbar
2. Tables & Forms — Table, Modal, ConfirmDelete, FilterBar, Pager. Страницы: PagesList/Blocks/Protocols
3. Complex forms — Accordion, AddTelemetryModal, страница Телеизмерения
4. Dashboard & Charts — PBRChart/ThreeMinChart/GOUChart на Recharts, страница Страница 1 (view)
5. Editing mode — режим edit дашборда, DnD, AddWidgetModal, WebSocket live-update
6. Polish — Toasts, Dropdowns, Settings Drawer, keyboard shortcuts, a11y audit

### Рекомендации по стеку (уже в `package.json`)
- **Routing**: React Router 6 (`react-router-dom`)
- **Server state**: TanStack Query
- **Tables**: TanStack Table (headless) + собственный рендер по `components.css`
- **Forms**: React Hook Form + Zod (schema-validation)
- **Charts**: Recharts (для типовых) + чистый SVG (для IBCS-специфики: см. `app/Charts.jsx`)
- **Icons**: `lucide-react` (в прототипе — inline SVG в том же стиле)
- **Dates**: `date-fns`
- **CSS**: `tokens.css` + `components.css` подключаются в `index.html`. При желании можно портировать в CSS Modules — каждая переменная `--*` при этом остаётся источником правды.

---

## Docker (опционально)

Пример `Dockerfile` для production:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Не забудьте про `nginx.conf` с fallback на `index.html` для SPA-роутинга:
```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}
```

---

## Traceability (что откуда пришло)

- **Токены** (`tokens.css`) — извлечены пиксельным сэмплированием фирменной презентации ЕАЕ и логотипа. См. Step 1 - Audit.html для деталей.
- **Компоненты** (`components.css`) — реализация на BEM, соответствует showroom'у в Step 2 - UI Kit.html.
- **Экраны** — интерактивные React-прототипы в `app/pages/*.jsx`. Референс поведения — Step 3 - Prototype.html.
- **Терминология** (ПБР, УДГ, УДГКЭ, МЭК-104, ГОУ, «код качества» и т.д.) — сохранена 1:1 из легаси системы.
