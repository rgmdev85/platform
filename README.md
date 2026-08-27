# Handoff: ЕАЕ:Платформа — Full Modernization Package

## Overview

Полный пакет модернизации UI диспетчерской системы **ЕАЕ:Платформа** (SCADA / энергетика). Включает:

1. **Аналитический аудит** легаси-интерфейса и извлечённых бренд-атрибутов из корпоративной презентации.
2. **Production-ready UI Kit** (design tokens + библиотека компонентов на BEM-CSS).
3. **Интерактивный React-прототип** со всеми экранами системы: дашборд, CRUD-страницы блоков / протоколов / телеизмерений / страниц, модалки, drawer «Настройки», dropdown-меню, toast-система, фильтр-бары в стиле Tableau.

**Целевые пользователи**: администраторы и инженеры-операторы (роль «Администратор» — Пётр Петрович на легаси-скриншотах). Ключевые сценарии: настройка протоколов сбора данных (МЭК-104, Modbus RTU/TCP, OPC UA), управление блоками/схемами/телеизмерениями, мониторинг работы генерирующих блоков в реальном времени по метрикам ПБР, трёхминутной выработки и статусу блоков ГОУ.

**Визуальный язык** — на пересечении стандартов IBCS (International Business Communication Standards), Zebra BI (variance highlighting, small multiples) и Tableau (интерактивные фильтры, drill-down, rich tooltips), с соблюдением эвристик Якоба Нильсена и WCAG AA.

---

## About the Design Files

Файлы в этом бандле — **дизайн-референсы, реализованные в HTML/CSS/JSX (Babel inline)**. Это высокоточные интерактивные прототипы, показывающие целевой внешний вид, взаимодействия и токены дизайна, но **не production-код для прямого копирования**.

Задача разработчика — **воспроизвести эти макеты в существующей кодовой базе продукта** (заявленный целевой стек — **React 18+**), используя её принятые библиотеки и паттерны (state-management, роутинг, форм-либа, chart-либа).

### Что напрямую переиспользуется
- `tokens.css` — импортировать в проект как есть, либо смэппить значения на токены целевой библиотеки (Tailwind config / MUI theme / styled-system).
- `components.css` — BEM-стили, можно взять как основу и портировать в CSS Modules / styled-components.
- Логика JSX-компонентов — как reference-имплементация (структура, props, состояния).

### Что переписывается
- Babel inline JSX (Design-режим) → нативный TSX через Vite + esbuild.
- Роутинг на `location.hash` → **React Router 6** или **TanStack Router**.
- In-memory моки → **TanStack Query** + real API endpoints.
- Inline SVG-графики → **Recharts** / **Visx** с кастомными IBCS-конфигурациями.
- Формы (сейчас ручные useState) → **React Hook Form** + **Zod** для валидации.

---

## Fidelity

**High-fidelity (hifi).** Точные HEX-значения цветов извлечены пиксельным сэмплированием фирменной презентации и логотипа. Типографическая шкала, отступы (4/8-grid), радиусы, тени, состояния всех компонентов — финальные. Все экраны интерактивны — можно кликать, открывать модалки, добавлять/удалять записи, переключать режимы дашборда.

Разработчик должен воспроизводить UI **пиксель-в-пиксель**, используя библиотеки существующей кодовой базы. Все bindings мок-данных заменяются на реальные API-запросы; **вся визуальная логика сохраняется 1:1**.

---

## Design Deliverables — состав бандла

### Документация процесса
| Файл | Что это |
|---|---|
| `Step 1 - Audit.html` | Аналитический отчёт: аудит легаси-скринов, извлечённая палитра, типографика, инвентарь компонентов, принципы IBCS/Zebra BI/Tableau, эвристики Нильсена |
| `Step 2 - UI Kit.html` | Полный showroom UI Kit со всеми компонентами и состояниями, IBCS data-viz компонентами |
| `Step 3 - Prototype.html` | **Главный артефакт** — интерактивный прототип всей системы. Точка входа для запуска |

### CSS foundation (готово к импорту)
| Файл | Содержимое |
|---|---|
| `tokens.css` | Все design tokens как CSS custom properties (цвета, типографика, отступы, радиусы, тени, motion, z-index, layout) |
| `components.css` | BEM-стилизованные компоненты (buttons, inputs, tables, modals, alerts, toasts, sidebar, topbar, badges, chips, кастомные checkbox/radio/toggle, pagination, skeleton, accordion, filter-bar) — ссылаются только на переменные из `tokens.css` |

### React-компоненты прототипа
```
app/
├── Icons.jsx              — Lucide-style SVG иконки (30+ штук, все stroke, currentColor)
├── mock.jsx               — мок-данные: блоки, протоколы, телеизмерения, страницы, PBR-серии, три-мин, ГОУ
├── Overlays.jsx           — ToastProvider + useToast(), Modal, Drawer, Dropdown menu
├── Charts.jsx             — SVG-графики: PBRChart (24ч line), ThreeMinChart (bars с зоной допуска), GOUChart (status), Sparkline
├── Shell.jsx              — Sidebar, Topbar, Layout, useRouter (hash-based), PageHeader
├── App.jsx                — корень приложения + SettingsDrawer + роутер
└── pages/
    ├── CRUDCommon.jsx     — FilterBar, ConfirmDelete, RowActions, Pager, StatusBadge
    ├── Dashboard.jsx      — «Страница 1»: view/edit modes, BlockCard, AddWidgetModal
    ├── Blocks.jsx         — CRUD блоков + AddBlockModal с валидацией
    ├── Protocols.jsx      — CRUD протоколов + AddProtocolModal (IP-mask, port range validation)
    ├── Telemetry.jsx      — CRUD телеизмерений + сложная AddTelemetryModal с accordion
    └── PagesList.jsx      — список дашбордов + AddPageModal
```

### Ассеты и справочные материалы
- `brand/eae_logo.png` — оригинальный логотип ЕАЕ
- `legacy/*.png` — 11 скриншотов текущей системы для сравнения «до/после»

---

## Терминология (ГОСТ / АСУТП)

Все интерфейсные строки приведены к отраслевой терминологии АСУТП без энергетической специфики (нейтральный производственный/бизнес KPI). Ключевые соответствия:

| Раздел | Название в UI |
|---|---|
| Widget · Значения | **KPI / Числовые показатели** |
| Widget · График | **Тренды** |
| Widget · Мнемосхема | **Мнемосхема ТП** (интерактивная технологическая схема) |
| Widget · Superset | **BI-Аналитика (Superset)** |
| Widget · Текст | **Текстовый блок** |
| Widget · Внутр. ссылка | **Переход по системе** |
| Widget · Внеш. ссылка | **Внешний ресурс** |
| Директория · Приём данных | **Сбор и первичная обработка данных** |
| Директория · Телесигналы | **Дискретные сигналы (ТС)** |
| Директория · Телеизмерения | **Аналоговые параметры (ТИ)** |
| Директория · Значения | **Текущие параметры** |
| Директория · Графики | **Библиотека трендов** |
| Директория · Схемы | **Графические формы (Мнемосхемы)** |

## Мнемосхема ТП — SVG-виджет

Виджет «Мнемосхема ТП» рендерит однолинейную схему подстанции (файл `app/pages/Dashboard.jsx`, компонент `<SubstationScheme/>`):
- Тёмный фон `#4A4E52`, жёлтые линии `#E4C64A` — стандарт АСУТП
- Две системы шин `1 С 6` + `2 С 6` с секционным выключателем
- 10 ячеек (105–101, 201–205), в каждой: разъединитель · ВВ (белый квадрат) · ТТ (круг с крестом) · ТН (3 пересекающихся круга) · ОПН (прямоугольник)
- Параметры сверху ячеек: `I · P · Q` для линий, `Ua/Ub/Uc/Uab/Ubc/Uca/f` для шинных ТН
- Стрелки «К Т-1» / «К Т-2» на трансформаторы, стрелки выхода линий «Л-13» / «Л-8»
- Референс: `brand/scheme_reference.png`

## Screens / Views

Все экраны на **русском языке**, все терминологические названия сохраняются 1:1 из легаси (ПБР, УДГ/УДГК, ТМ, МЭК-104, ГОУ, «телеизмерение», «код качества», «Modbus terminal» и т.д.).

Роутинг — hash-based: `#/dashboard`, `#/blocks`, `#/protocols`, `#/telemetry`, `#/pages`.

### 1. Dashboard — «Страница 1» (главный экран `#/dashboard`)

- **Purpose**: главный экран мониторинга генерирующих блоков в реальном времени.
- **Layout**:
  - Sidebar (232px) + main content column
  - PageHeader с h1 «страница 1», описанием «Диспетчерский пульт УДГК-1 · обновление данных каждые 5 секунд» и action-кнопками справа
  - Стек `<BlockCard>` компонентов, по одному на блок

- **Actions в PageHeader (режим view)**:
  - Secondary: «Экспорт» → toast «Формируется PDF-отчёт…»
  - Primary: «Редактировать» → переключает в режим edit

- **Actions в PageHeader (режим edit)**:
  - Select «Выберите юнит…» с опциями (Схема_1, Блок_3, Блок_4)
  - Brand: «+ Добавить виджет» → открывает `AddWidgetModal`
  - Success: «Готово» → возврат в view + success toast

- **`<BlockCard>` компонент** (сложный, из 4 секций):
  1. **Header** (padding 14/20, border-bottom `--ink-100`)
     - В режиме edit: drag-handle слева (`IconDrag`, cursor:grab)
     - Заголовок блока (h-3, 17px) + метаданные под ним («Выгрузка сформирована 2026-08-24 10:06:03 · протокол: Modbus TCP», caption mono)
     - Справа: в view — breadcrumbs (Home / Блок_N); в edit — кнопка × удаления виджета (danger color)
  2. **Toolbar** (`--ink-050` фон, border-bottom):
     - Label «Дата» + DatePicker (`<input>` с IconCalendar, ширина 180px)
     - Success кнопка «▶ Показать данные»
     - Справа три KPI-элемента:
       - KPI-плашка «Температура · 62.28 °C» (info color)
       - Secondary Dropdown «Отклонения · 3 ▾» (в danger стилизации: red border, red-soft bg, red text) — раскрывается меню с последними отклонениями + «Экспорт в Excel»
       - Secondary Dropdown «Лог команд · 12 ▾» — команды УДГ/УДГК
  3. **Chart 1: PBR 24-hour line chart** (`padding: 16px 20px 8px`)
     - Заголовок «{Блок} :: График ПБР 14 :: 40.00%» + inline-легенда сверху справа
     - Легенда: **УДГКЭ** (dashed синяя, верхний лимит), **УДГ** (dashed охра, нижний лимит), **ФАКТ** (solid red 2.2px, фактические значения), **ПБР** (dashed grey 1.8px, плановая кривая). Uppercase, inline flex-row в правом углу заголовка карточки
     - `<PBRChart>` компонент: SVG 900×260, viewBox масштабируется. Y-шкала 60–220 МВт с сеткой каждые 20. X-шкала 00:00–24:00 с шагом 3 часа. Вертикальная пунктирная линия «Сейчас» на последней fact-точке с красным маркером
  4. **Charts 2+3 side-by-side** (grid 2fr:1fr, gap 16, padding 0/20/16):
     - **Три-минутная выработка** (h-4, 13px): `<ThreeMinChart>` — 60 столбиков за 3 часа, зелёная полупрозрачная зона допуска 145–165, красные пунктирные лимиты, столбики за пределами зоны — красные, внутри — тёмно-серые. X-подписи «0 мин»..«180 мин»
     - **Блоки ГОУ** (h-4, 13px): `<GOUChart>` — 60 вертикальных статусных столбцов (зелёный ok / красный alarm), вертикальная линия текущего момента, подписи «0м».«60м»

- **Empty state** (когда нет виджетов): centered state с IconGrid 40px, title «Пустой дашборд», body «Добавьте первый виджет, чтобы начать мониторинг блоков.», CTA «+ Добавить виджет»

- **Edit mode indicator** — info-alert над стеком карточек: «Режим редактирования · Перетаскивайте виджеты за :: слева от заголовка, удаляйте через × справа»

- **`AddWidgetModal`** (см. секцию Modals ниже)

### 2. Управление страницами (`#/pages`)

- Таблица дашбордов с колонками: Имя страницы (с IconLayout) · Статус (badge success `Опубликована` / warning `Черновик`) · Виджетов (num) · Автор · Дата создания (mono) · Действия (Eye/Settings/Trash icons)
- Кнопка «+ Создать страницу» → `AddPageModal` с одним полем «Название страницы»
- Клик на имя строки → переход `#/dashboard`

### 3. Управление блоками (`#/blocks`)

- Таблица: чекбокс · Имя блока (с IconDatabase) · ID Modbus terminal (mono) · Телеизмерений (num) · Дата создания (mono, sorted DESC по умолчанию) · Действия
- Поиск в PageHeader actions + кнопка «Обновить» (secondary) + brand «+ Создать блок»
- Sortable колонки (Имя, ID Modbus, Дата)
- `AddBlockModal`: 2 поля с валидацией. `ID Modbus terminal` (только цифры), `Название блока` (required). Кнопка `Далее ›` (brand) — валидирует и вызывает onSave
- ConfirmDelete с обязательным чекбоксом
- Empty state при пустом фильтре

### 4. Управление протоколами (`#/protocols`)

- Таблица: Имя (с IconCode) · Протокол (info badge) · Адрес станции/NS (num mono) · Порт (num) · IP сервера (mono) · Резервный IP (mono, muted если «—») · Действия
- Кнопка «+ Создать протокол» → `AddProtocolModal` (size lg)
- **AddProtocolModal**: 6 полей в 2-колоночной grid-раскладке (`Имя` full-width, `Протокол`+`Порт`, `IP`+`Резервный IP`, `Адрес станции` full-width)
- Валидация:
  - Имя: required
  - IP сервера: required + regex `/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/`
  - Резервный IP: optional + тот же regex если заполнен
  - Порт: required + число 1–65535
  - Адрес станции: required

### 5. Управление телеизмерениями (`#/telemetry`)

Ключевой экран с наибольшим количеством взаимодействий.

- **FilterBar** сверху (Tableau-style): активные чипы «Блок: Блок_1, Блок_2 ×», «Тип: Float ×» + `+ фильтр` + `Сбросить всё` + справа счётчик «47 строк»
- **Bulk-toolbar** появляется когда выделены чекбоксами строки: `background: --info-soft`, «Выбрано: N» + кнопки «Изменить блок…», danger «Удалить выбранные», ghost «Снять выделение» справа
- **Таблица**: чекбокс (с header-toggle) · Время прихода сигнала (mono, sortable, sorted DESC) · Блок / Схема (neutral badge или «—») · Имя · Тип сигнала (info badge) · Код качества (num, красный+bold если 0) · Последнее значение (num) · Действия
- **Пагинация**: 20/50/100 rows per page, кнопки ‹ 1 2 3 4 5 › + счётчик «Строк: 1–20 из 47»
- **`AddTelemetryModal`** (size lg) — самая сложная форма:
  - Accordion «Создать новый протокол» (свёрнут по умолчанию, кнопка справа «необязательно» / «скрыть»). Внутри — grid с полями Стандарт протокола / Имя протокола / Адрес порта / IP сервера / Адрес станции
  - Чекбокс «Использовать типовые параметры» (checked по умолчанию)
  - Grid 2-колоночный: Протокол (select с существующими) + Адрес телеизмерения + Имя телеизмерения (full-width) + Тип сигнала (Float/Int/Bool/String)
  - Buttons: «Назад» (ghost) + «Сохранить телеизмерение» (brand, disabled пока форма невалидна)

### 6. Sidebar (постоянный)

- Brand-блок (var --eae-red) сверху 56px: логотип 24×24 + «ЕАЕ:Платформа»
- Группа «Мониторинг»:
  - Страница 1 (IconGrid) — активная по умолчанию
  - Схемы (IconMap) — disabled с badge «вне scope»
- Группа «Администрирование»:
  - Управление страницами (IconLayout)
  - Блоки (IconDatabase)
  - Протоколы (IconCode)
  - Телеизмерения (IconActivity)
- Footer: «v.4.2.0 · build 2026.08» (mono, muted)
- Активный пункт имеет: `--ink-sidebar-active` bg + красная полоса `--eae-red` 3px слева `::before`

### 7. Topbar (постоянный)

- **Left**: ghost-icon-btn «Свернуть навигацию» + breadcrumbs (Home / Раздел / Текущая страница)
- **Center**: `<input>` с IconSearch, placeholder «Поиск по всей системе · Ctrl+K», max-width 480px
- **Right**:
  - Bell-icon с красной точкой уведомления → Dropdown «Уведомления · 3 новых»
  - Settings-icon → открывает Settings Drawer справа
  - Divider vertical
  - User-block: avatar «ПП» (28×28 круг, ink-800 bg) + name «Пётр Петрович» + role «Администратор» + IconChevronDown → Dropdown с профилем и логаутом

### 8. Settings Drawer (справа)

Слайдит справа при клике на ⚙, ширина 340px, backdrop `rgba(15,23,32,.35)`.

- Секция «Разделы»: Приём данных (IconRadio) · Телесигнализация (IconWarning, badge 3) · Телесигналы (IconZap) · Блоки (IconDatabase, ссылка `#/blocks`) · Схемы (IconMap)
- Divider
- Секция «Внешние инструменты»: карточка «Редактор мнемосхем» (IconEdit в red, border-box)
- Divider
- Секция «Информация»: version / build / API endpoint / Kafka info (mono, muted, JetBrains Mono)

---

## Modals (полный список)

Все модалки поддерживают: закрытие по Esc, backdrop click, `body { overflow: hidden }` при открытии, `role="dialog" aria-modal="true"`, focus trap, анимации fadeIn + modalIn.

| Trigger | Modal | Size | Поля |
|---|---|---|---|
| Кнопка «+ Создать страницу» | `AddPageModal` | md (480px) | Название страницы |
| Кнопка «+ Создать блок» | `AddBlockModal` | md | ID Modbus terminal (число), Название блока |
| Кнопка «+ Создать протокол» | `AddProtocolModal` | lg (720px) | Имя, Протокол, IP, Резервный IP, Порт, Адрес станции |
| Кнопка «+ Создать поле измерения» | `AddTelemetryModal` | lg | Accordion + Протокол, Адрес ТМ, Имя, Тип сигнала |
| Кнопка «+ Добавить виджет» в режиме edit дашборда | `AddWidgetModal` | md | Select юнита |
| Delete-иконка в любой таблице | `ConfirmDelete` | md | Чекбокс «Я понимаю, что действие необратимо» + danger button |

**Анимации**:
- Backdrop: `fadeIn 180ms ease-out`
- Modal: `modalIn 200ms cubic-bezier(.2,.7,.2,1)` (opacity 0→1, translateY 8px→0, scale .98→1)

---

## Toasts

Глобальная система через `useToast()` хук из `Overlays.jsx`. Позиционирование: `position: fixed; top: 72px; right: 20px; z-index: 90;`.

**API**:
```jsx
const toast = useToast();
toast.success('Заголовок', 'Описание');
toast.error('...', '...');
toast.warning('...', '...');
toast.info('...', '...');
toast.push({ variant, title, desc, duration, action: { label, onClick } });
toast.dismiss(id);
```

**Дизайн тоста**: тёмный (ink-800) с белым текстом, `shadow-lg`, минимум 320px, максимум 420px, gap 10px между несколькими.

**Анимация**: `toastIn 200ms cubic-bezier(.2,.7,.2,1)` — slide-in справа.

**Auto-dismiss**: 4500ms по умолчанию. Можно передать `duration: 0` для «навсегда» или другое число.

**Action-кнопка** (например, «Отменить») используется для undo-паттерна при удалении.

---

## Dropdowns

Универсальный `<Dropdown>` компонент из `Overlays.jsx`:

```jsx
<Dropdown
  align="right" | "left"
  trigger={<Button/>}
  items={[
    { header: 'Заголовок группы' },
    { icon, label, onClick, shortcut, badge, disabled, danger },
    { divider: true },
    // …
  ]}
/>
```

**Поведение**:
- Клик вне закрывает
- Esc закрывает
- Анимация `ddIn 140ms`
- z-index 60

**Используется в**: топбар (уведомления, профиль), KPI дашборда («Отклонения ▾», «Лог команд ▾»), row-actions таблиц.

---

## Charts — детальные спецификации

### PBRChart (24-часовой график ПБР)
- **Container**: SVG viewBox="0 0 900 260", preserveAspectRatio, width 100%
- **Padding**: L=40, R=20, T=30, B=30
- **Y-scale**: 60–220 МВт, gridlines каждые 20 (thin `--ink-100`)
- **X-scale**: 0–24 часа, gridlines каждые 3 часа (very thin `--ink-050`)
- **Baseline**: horizontal line at y=0 в стиле `--ink-600` 1.2px
- **Серии**:
  - `kztk` (константа 165) — dashed 1.2px `--line-kztk` (blue), opacity .7
  - `kz2` (константа 155) — dashed 1.2px `--line-kz2` (teal), opacity .7
  - `kzs` (константа 135) — dashed 1.2px `--line-kzs` (охра), opacity .7
  - `plan` (плановая, гладкая) — dashed 4-3 pattern, 1.8px `--line-plan` (grey)
  - `fact` (фактическая, обрывается на текущем часе) — solid 2.2px `--line-fact` (red)
- **«Сейчас»-маркер**: последняя fact-точка → красный circle r=4, вертикальная grey dashed линия сверху вниз, подпись «Сейчас» в 6px правее
- **Данные**: массив из 48 точек (шаг 30 мин)

### ThreeMinChart (Трёхминутная выработка)
- **Container**: SVG viewBox="0 0 900 140"
- **Y-scale**: 125–175 МВт
- **Зона допуска**: `<rect>` от 145 до 165 с fill `--success-soft` opacity .5
- **Лимитные линии**: `--danger` 1px dashed 3-2 pattern сверху и снизу зоны
- **Столбики**:
  - В пределах зоны: `--ink-600` opacity .8
  - Вне зоны: `--danger` opacity 1
- **X-labels**: «0 мин», «30 мин», ..., «180 мин»
- **Данные**: массив из 60 значений

### GOUChart (Блоки ГОУ)
- **Container**: SVG viewBox="0 0 400 140"
- **Столбики**: 60 узких вертикальных полос на всю высоту, `--success` opacity .55 для ok, `--danger` opacity 1 для alarm
- **Marker**: вертикальная жирная линия `--ink-800` 1.5px на последней позиции (current moment)

### Sparkline (для KPI)
- **Container**: SVG viewBox="0 0 120 24", preserveAspectRatio="none"
- **Path**: single stroke line, color через currentColor prop

---

## Interactions & Behavior

### Общие правила
- **Fokus visible ring** через `--shadow-focus: 0 0 0 3px rgba(31,111,235,.24)` для всех интерактивных элементов
- **Все transitions** — `120ms cubic-bezier(.2,.7,.2,1)` для мелких взаимодействий, `180ms` для дропдаунов и тоастов, `240ms` для модалок и drawer
- **Hover states** для кнопок и строк таблиц: изменение background и/или border-color

### Формы
- **Client-side валидация в реальном времени** (не только на submit)
- **Дизейбл submit-кнопки** пока форма невалидна
- **Inline errors** прямо под полем с IconAlert и сообщением на русском
- **Обратная связь после submit** — success toast + сброс модалки + опциональный action «Отменить» (undo)

### Таблицы
- **Sortable columns**: клик по заголовку → asc → desc, индикация ↑/↓/↕
- **Row hover**: `background: --ink-050`
- **Row select**: чекбокс → `background: --info-soft`
- **Header checkbox** — toggle all rows on current page
- **Bulk toolbar** появляется когда `selected.length > 0`
- **Пустой поиск** → EmptyState с иконкой и предложением

### Confirmations
Все деструктивные действия — через `<ConfirmDelete>` с явным чекбоксом «Я понимаю…» перед активацией красной кнопки «Удалить».

### Undo-pattern
После delete-действия toast показывает action «Отменить» — клик восстанавливает удалённую запись.

### Live-обновление данных (concept для реальной интеграции)
- WebSocket или polling каждые 5 секунд
- Индикатор «обновлено N сек назад» в шапке карточки
- При потере соединения — inline `<Alert warning>` над контентом

### Keyboard shortcuts (в комментариях UI, реализованы частично)
- `Ctrl+K` — глобальный поиск (placeholder уже есть)
- `Esc` — закрыть модалку / drawer / dropdown (реализовано)
- `Enter` в форме — submit (React default)

---

## State Management

В прототипе — локальный React `useState`. В production рекомендуется:

**Global state** (Zustand или Redux Toolkit):
- `auth`: currentUser, role
- `notifications`: toast queue, undo queue
- `sidebar`: collapsed/expanded
- `filters`: активные фильтры каждой таблицы (сохраняются в URL query params)

**Server state** (TanStack Query):
- `useBlocks()`, `useBlock(id)`, `useCreateBlock()`, `useUpdateBlock()`, `useDeleteBlock()`
- `useProtocols()`, `useProtocol(id)`, `useCreateProtocol()`, …
- `useTelemetryList(filters, pagination)`
- `usePageData(pageId)` — конфигурация виджетов
- `useLiveTelemetry(blockId, dateFrom, dateTo)` — real-time через WebSocket или polling

**Form state** (React Hook Form + Zod):
```ts
const ProtocolSchema = z.object({
  name: z.string().min(1, 'Обязательное поле'),
  protocol: z.enum(['МЭК-104', 'Modbus RTU', 'Modbus TCP/IP', 'OPC UA']),
  ipServer: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 'Неверный формат IP'),
  backupIp: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/).optional().or(z.literal('')),
  port: z.coerce.number().int().min(1).max(65535, 'Значение вне диапазона 1–65535'),
  stationAddr: z.string().min(1, 'Обязательное поле'),
});
```

**URL state** (React Router / TanStack Router):
- Активные фильтры, sort, pagination, выбранная дата на дашборде — всё в query string для shareable-ссылок.

---

## Design Tokens

Полная спецификация — в `tokens.css`. Ниже — сокращённая справка.

### Colors

**Brand**:
- `--eae-red: #EC0033` (основной акцент)
- `--eae-red-hover: #C4002B`
- `--eae-red-active: #A00023`
- `--eae-red-soft: #FFF0F3`

**Sidebar (из легаси)**:
- `--ink-sidebar: #222D31`
- `--ink-sidebar-hover: #2E3A40`
- `--ink-sidebar-active: #37444B`

**Ink шкала** (10 ступеней): `--ink-000` (#FFFFFF) → `--ink-050` (#F5F7FA) → `--ink-100` (#EAEEF2) → `--ink-200` (#D8DEE5) → `--ink-300` (#B6BEC8) → `--ink-400` (#8A96A3) → `--ink-500` (#5F6D7C) → `--ink-600` (#455260, body) → `--ink-700` (#2B3843) → `--ink-800` (#1B2530, headings) → `--ink-900` (#0F1720, KPI numbers).

**Semantic** (все с `-soft` и `-hover` вариантами):
- Success: `#2E8540` / soft `#E7F3EA`
- Warning: `#B26A00` / soft `#FFF3E0`
- Danger: `#C0392B` / soft `#FDEBE7`
- Info: `#1F6FEB` / soft `#E7EEFD`

**IBCS data-viz** (закреплённая семантика — не менять):
- `--data-actual: #111111` (заливка)
- `--data-plan: #8A96A3` (только контур)
- `--data-py: #B6BEC8` (previous year)
- `--data-forecast: #5F6D7C` (штриховка)
- `--data-variance-pos: #2E8540`
- `--data-variance-neg: #C0392B`

**Легенда графиков ПБР**:
- `--line-kztk: #1F6FEB` (blue)
- `--line-kz2: #17828A` (teal)
- `--line-kzs: #B26A00` (охра)
- `--line-fact: #C0392B` (red)
- `--line-plan: #8A96A3` (grey)

### Typography
- **Sans**: `Inter` (400/500/600/700) — Google Fonts
- **Mono**: `JetBrains Mono` (400/500) — Google Fonts
- **Sizes**: 11, 12, 13, 14 (base), 15, 16, 18, 22, 28, 36, 48 px
- **Line heights**: 1.15 (tight), 1.35 (snug), 1.55 (normal)
- **Все числа** — с `font-variant-numeric: tabular-nums`

### Spacing (4/8 grid)
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80` px (токены `--sp-1` … `--sp-20`).

### Radii
`2, 4, 6, 8` px + `999px` pill (`--r-xs` … `--r-pill`).

### Shadows
- `--shadow-xs` — 1px subtle
- `--shadow-sm` — карточки при hover
- `--shadow-md` — dropdowns
- `--shadow-lg` — модалки, тосты
- `--shadow-focus` — фокус-ринг info-color

### Layout
- Topbar: 56px
- Sidebar: 232px (expanded), 56px (collapsed)
- Container max: 1600px
- Breakpoints: desktop ≥1440, laptop 1280, tablet 768 (view-only, mobile не поддерживается)

### Motion
- `120ms` — быстро (кнопки)
- `180ms` — стандарт (toast, tooltip)
- `240ms` — медленно (modal, drawer)
- Easing: `cubic-bezier(.2,.7,.2,1)` — крутой на входе, мягкий на выходе

### Z-index
40 sidebar · 50 topbar · 60 dropdown · 70 modal-backdrop · 80 modal / drawer · 90 toast · 100 tooltip

---

## Accessibility (WCAG AA)

- **Контраст текста**: `--ink-600` на `--ink-000` = 8.4:1 ✅; `--ink-500` на белом = 5.9:1 ✅
- **Focus-visible ring** для всех интерактивных элементов
- **Semantic HTML5**: `<nav>`, `<main>`, `<header>`, `<aside>`, `<button type="button">`, `<label>` для полей
- **ARIA**:
  - `aria-label` на icon-only кнопках
  - `role="dialog" aria-modal="true"` на модалках
  - `aria-sort` на sortable колонках
  - `aria-current="page"` на активной nav-ссылке
- **Keyboard nav**: полная навигация Tab / Shift+Tab / Enter / Space / Esc
- **Prefers-reduced-motion**: TODO — отключать animations в `@media (prefers-reduced-motion: reduce)`

---

## Assets

| Файл | Источник | Назначение |
|---|---|---|
| `brand/eae_logo.png` | Из фирменной презентации ЕАЕ:Платформа | Логотип в шапке сайдбара, favicon |
| Inter webfont | Google Fonts | Основной interface font |
| JetBrains Mono webfont | Google Fonts | Числа, коды, даты, ID |

**Иконки**: в прототипе — набор inline SVG в стиле Lucide/Feather (24×24, stroke 2, currentColor). Список из `app/Icons.jsx`: Grid, Layers, Layout, Database, Code, Activity, Search, Bell, Settings, ChevronLeft/Right/Down/Up, Plus, Trash, Edit, Close, Check, Alert, Warning, Info, Calendar, Play, More/MoreV, Drag, Home, Download, Filter, Refresh, Eye, Terminal, Map, FileText, Zap, Radio.

В production рекомендуется взять **Lucide Icons** через NPM (`lucide-react`) — покрывает 100% используемых иконок.

**Логотип**: PNG 60×59, 1.6 KB. Если удастся получить SVG-версию от заказчика — заменить.

---

## Как запустить

Полная инструкция — в `SETUP.md`. Кратко:

### Режим 1 — просмотр прототипа (без установки npm)
```bash
npx serve . --listen 5174
```
Открыть `http://localhost:5174/Step 3 - Prototype.html`

### Режим 2 — начало разработки production-версии
```bash
npm install
npm run dev
```
Готовый Vite + React 18 + TypeScript скелет уже в бандле (`package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`).

### Основные npm-скрипты
| Команда | Что делает |
|---|---|
| `npm run dev` | Vite dev-сервер с HMR (порт 5173) |
| `npm run build` | Production-сборка в `dist/` |
| `npm run preview` | Просмотр production-сборки локально |
| `npm run typecheck` | TypeScript без сборки |
| `npm run lint` / `format` | ESLint / Prettier |
| `npm run test` | Vitest |
| `npm run prototype` | Оригинальный HTML-прототип (порт 5174) |

---

## Files (полный манифест бандла)

```
design_handoff_eae_platform_full/
├── README.md                          ← этот файл (единственный источник правды)
├── SETUP.md                           ← инструкция по установке и запуску
│
├── package.json                       ← npm-скелет (React 18 + Vite + TS + все зависимости)
├── vite.config.ts                     ← конфиг Vite (alias @/, code-splitting, proxy к бэку)
├── tsconfig.json + tsconfig.node.json ← TypeScript strict-mode
├── .eslintrc.cjs + .prettierrc.json   ← линт и форматирование
├── .gitignore                         ← стандартный ignore для Vite-проекта
├── index.html                         ← entry для production-сборки Vite
│
├── src/                               ← production-код (стартовый скелет)
│   ├── main.tsx                       React root + QueryClient + Router
│   ├── App.tsx                        роутинг с заглушками экранов
│   └── vite-env.d.ts
│
├── Step 1 - Audit.html                ← аналитический аудит + принципы
├── Step 2 - UI Kit.html               ← showroom всех компонентов
├── Step 3 - Prototype.html            ← ★ главный интерактивный прототип (Babel inline)
│
├── tokens.css                         ← все design tokens
├── components.css                     ← BEM-стили компонентов
│
├── app/                               ← React JSX (Babel inline)
│   ├── Icons.jsx                      Lucide-style иконки
│   ├── mock.jsx                       мок-данные
│   ├── Overlays.jsx                   Toast, Modal, Drawer, Dropdown
│   ├── Charts.jsx                     SVG-графики
│   ├── Shell.jsx                      Sidebar, Topbar, Layout, Router
│   ├── App.jsx                        корень + SettingsDrawer
│   └── pages/
│       ├── CRUDCommon.jsx             FilterBar, ConfirmDelete, Pager, RowActions
│       ├── Dashboard.jsx              страница 1 (view/edit/add-widget)
│       ├── Blocks.jsx                 CRUD блоков
│       ├── Protocols.jsx              CRUD протоколов
│       ├── Telemetry.jsx              CRUD телеизмерений
│       └── PagesList.jsx              список дашбордов
│
├── brand/
│   └── eae_logo.png                   логотип ЕАЕ
│
└── legacy/                            11 скринов легаси для сравнения
    ├── 01-add-scheme.png
    ├── 02-add-block-form.png
    ├── 03-blocks-list.png
    ├── 04-add-telemetry.png
    ├── 05-telemetry-management.png
    ├── 06-add-protocol.png
    ├── 07-protocols-management.png
    ├── 08-page1-widget-settings.png
    ├── 09-page1-add-widget.png
    ├── 10-page1-edit-mode.png
    └── 11-page1-view-mode.png
```

---

## Приоритеты для разработки

Если ресурсы ограничены, рекомендуемая последовательность реализации:

1. **Foundation** (Sprint 1): `tokens.css` → theme-объект целевой либы. Базовые компоненты: Button, Input, Select, Checkbox, Radio, Toggle, Badge, Card. Layout: Sidebar, Topbar, PageHeader.
2. **Tables & Forms** (Sprint 2): Table (sortable, zebra, selectable, bulk-toolbar), Modal, ConfirmDelete, FilterBar, Pager. Экраны: Управление страницами, Блоки, Протоколы.
3. **Complex form + Telemetry** (Sprint 3): Accordion, AddTelemetryModal, экран Телеизмерения с фильтрами и bulk-действиями.
4. **Dashboard & Charts** (Sprint 4): PBRChart, ThreeMinChart, GOUChart на Recharts/Visx. Экран Страница 1 в режиме view.
5. **Dashboard editing** (Sprint 5): режим edit, drag'n'drop виджетов, AddWidgetModal, live-обновление через WebSocket.
6. **Polish** (Sprint 6): Toasts, Dropdowns (уведомления, отклонения, лог команд), Settings Drawer, keyboard shortcuts, accessibility audit.

---

## Contact / Questions

При возникновении вопросов по спецификациям, приоритетам или деталям поведения — обращаться к заказчику дизайна (лицо, инициировавшее этот handoff в Genspark Design).
