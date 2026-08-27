// Mock data + helpers для прототипа
// Терминология: абстрактный производственный / бизнес KPI (без отраслевой специфики)

// Mock blocks (не используется в UI, но оставлен для обратной совместимости данных)
const mockBlocks = [
  { id: 1, name: "Линия_1", modbusId: "201071", createdAt: "2024-05-27 20:41:26", telemetryCount: 12 },
  { id: 2, name: "Линия_2", modbusId: "201090", createdAt: "2024-05-27 20:47:04", telemetryCount: 8 },
  { id: 3, name: "Участок_A", modbusId: "201101", createdAt: "2024-05-28 13:20:33", telemetryCount: 15 },
  { id: 4, name: "Участок_B", modbusId: "201115", createdAt: "2024-06-14 08:12:44", telemetryCount: 10 },
];

const mockProtocols = [
  { id: 1, name: "мэк-104-1",           protocol: "МЭК-104",       stationAddr: "12345", port: 8700,  ipServer: "127.0.0.1",      backupIp: "127.0.0.2" },
  { id: 2, name: "МЭК-104-2",           protocol: "МЭК-104",       stationAddr: "193",   port: 3404,  ipServer: "10.77.116.165",  backupIp: "—" },
  { id: 3, name: "Modbus-31",           protocol: "Modbus TCP",    stationAddr: "150",   port: 500,   ipServer: "10.77.116.165",  backupIp: "—" },
  { id: 4, name: "OPC-UA-Main",         protocol: "OPC UA",        stationAddr: "urn:plant:main", port: 4840, ipServer: "192.168.10.5", backupIp: "—" },
  { id: 5, name: "Modbus-42",           protocol: "Modbus TCP",    stationAddr: "160",   port: 502,   ipServer: "10.77.116.02",   backupIp: "10.77.116.03" },
  { id: 6, name: "МЭК-104-тест",        protocol: "МЭК-104",       stationAddr: "151",   port: 8196,  ipServer: "10.77.116.02",   backupIp: "—" },
];

const mockTelemetry = Array.from({ length: 47 }, (_, i) => {
  const sources = ["Линия_1", "Линия_2", "Участок_A", "Участок_B", "—"];
  const names = ["скорость_линии", "температура_подшипника", "давление_магистрали", "расход_сырья", "напряжение_фаза_A", "напряжение_фаза_B", "ток_нагрузки", "выработка_смены", "уровень_бака_1", "плотность_потока", "влажность_среды", "обороты_привода", "температура_охл", "давление_вспом", "температура_среды"];
  const t = new Date(2026, 7, 27, 9, 59 - (i * 2) % 40, 30 - i % 30);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    id: i + 1,
    time: `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`,
    block: sources[i % 5],
    name: names[i % names.length],
    signalType: "Float",
    quality: i === 3 || i === 17 || i === 31 ? 0 : 1,
    value: (Math.sin(i * 0.7) * 30 + 100 + (i * 3.7) % 60).toFixed(2),
  };
});

const mockPages = [
  { id: 1, name: "Главная",                    author: "Пётр Петрович",  createdAt: "2024-05-27 20:41:26", widgets: 12, status: "published" },
  { id: 2, name: "Производственный контур",    author: "Пётр Петрович",  createdAt: "2024-08-12 10:22:14", widgets: 5,  status: "published" },
  { id: 3, name: "Аварийный контур",           author: "Иван Смирнов",   createdAt: "2025-01-08 08:04:00", widgets: 2,  status: "draft" },
  { id: 4, name: "Отчёт по производству (Q2)", author: "Пётр Петрович",  createdAt: "2026-04-01 12:00:00", widgets: 7,  status: "published" },
];

// ============ Superset mock charts ============
function makeLineData(n, base, spread) {
  return Array.from({ length: n }, (_, i) => ({
    x: i,
    y: base + Math.sin(i * 0.4) * spread + (Math.random() - 0.5) * (spread / 2),
  }));
}
function makeBarData(labels, base) {
  return labels.map((label, i) => ({ label, value: base + (Math.random() * base * 0.6) + i * 4 }));
}

const supersetCharts = {
  ch_daily_output: {
    id: 'ch_daily_output',
    title: 'Суточный объём производства, т',
    subtitle: 'обновлено 09:56 · источник: DWH.gold_daily',
    type: 'line',
    dataset: makeLineData(24, 620, 60),
    url: 'https://superset.corp.local/superset/dashboard/production/#chart-1024',
  },
  ch_kpi_efficiency: {
    id: 'ch_kpi_efficiency',
    title: 'Эффективность по участкам, %',
    subtitle: 'август 2026 · среднее по сменам',
    type: 'bar',
    dataset: makeBarData(['Линия_1', 'Линия_2', 'Участок_A', 'Участок_B', 'Склад'], 42),
    url: 'https://superset.corp.local/superset/dashboard/production/#chart-2048',
  },
  ch_incidents: {
    id: 'ch_incidents',
    title: 'Инциденты по типам, шт',
    subtitle: 'последние 30 дней',
    type: 'pie',
    dataset: [
      { label: 'Отклонение от плана', value: 42 },
      { label: 'Задержка данных',     value: 18 },
      { label: 'Плохое качество',     value: 12 },
      { label: 'Прочее',              value: 6  },
    ],
    url: 'https://superset.corp.local/superset/dashboard/incidents/',
  },
  ch_revenue: {
    id: 'ch_revenue',
    title: 'Выручка, млн ₽',
    subtitle: 'по неделям · Q3 2026',
    type: 'line',
    dataset: makeLineData(12, 140, 20),
    url: 'https://superset.corp.local/superset/dashboard/finance/',
  },
};

// ============ Производственный график (мок для type='chart') ============
function generateProdChart() {
  const N = 48;
  const arr = { hour: [], plan: [], fact: [], consumption: [], planUpdated: [] };
  for (let i = 0; i < N; i++) {
    const h = i / 2;
    let plan = 100 + Math.sin((h - 6) * 0.35) * 45 + (h > 22 ? -20 : 0);
    arr.plan.push(plan);
    arr.fact.push(h < 13 ? plan + (Math.random() - 0.5) * 6 + (h > 8 && h < 11 ? 5 : 0) : null);
    arr.consumption.push(60 + Math.sin((h - 4) * 0.3) * 25 + (Math.random() - 0.5) * 3);
    arr.planUpdated.push(h < 10 ? plan : plan + 8 + Math.sin(h * 0.5) * 3);
    arr.hour.push(h);
  }
  return arr;
}
const mockProdChart = generateProdChart();

// ============ Справочник графиков ============
const mockChartsDirectory = [
  { id: 1, name: 'Производственный график',       linesCount: 4, indicators: 2, sources: ['ТИ', 'DWH', 'ручное'], lastUpdate: '2026-08-27 09:56:00', createdAt: '2026-08-01 10:00:00', usedIn: ['Главная'] },
  { id: 2, name: 'Мощность и КПД по участкам',    linesCount: 3, indicators: 1, sources: ['ТИ', 'DWH'],           lastUpdate: '2026-08-27 09:58:00', createdAt: '2026-08-05 12:14:22', usedIn: [] },
  { id: 3, name: 'Расход сырья по цехам',         linesCount: 6, indicators: 0, sources: ['DWH'],                 lastUpdate: '2026-08-27 06:00:00', createdAt: '2026-08-10 09:30:00', usedIn: ['Отчёт по производству (Q2)'] },
  { id: 4, name: 'Температурный контур',          linesCount: 4, indicators: 3, sources: ['ТИ', 'ТС'],            lastUpdate: '2026-08-27 09:55:00', createdAt: '2026-08-18 15:00:00', usedIn: [] },
];

// Справочник Значений
const mockValuesDirectoryList = [
  { id: 1, name: 'Суточная сводка производства',   fieldsCount: 4, sources: ['DWH', 'ТИ', 'ручное'], lastUpdate: '2026-08-27 09:56:03', createdAt: '2026-08-12 14:22:04', usedIn: ['Главная'] },
  { id: 2, name: 'Финансовые показатели',          fieldsCount: 3, sources: ['DWH', 'ручное'],       lastUpdate: '2026-08-27 08:00:00', createdAt: '2026-07-30 11:05:00', usedIn: ['Главная', 'Отчёт по производству (Q2)'] },
  { id: 3, name: 'Технические KPI Линия_1',        fieldsCount: 6, sources: ['ТИ', 'ТС'],            lastUpdate: '2026-08-27 09:58:00', createdAt: '2026-08-01 10:00:00', usedIn: [] },
  { id: 4, name: 'Оперативные показатели контура', fieldsCount: 5, sources: ['ТИ', 'DWH'],           lastUpdate: '2026-08-27 09:56:00', createdAt: '2026-08-18 16:44:20', usedIn: [] },
];

// ============ Каталог единиц измерения ============
const unitsCatalog = [
  { group: 'Проценты',      items: ['%'] },
  { group: 'Валюта',        items: ['₽', '$', '€'] },
  { group: 'Количество',    items: ['ед.', 'шт'] },
  { group: 'Масса',         items: ['кг', 'т', 'тонн'] },
  { group: 'Объём',         items: ['л', 'Гл', 'м³'] },
  { group: 'Длина',         items: ['м', 'м²'] },
  { group: 'Давление',      items: ['бар', 'Па', 'кПа', 'МПа'] },
  { group: 'Температура',   items: ['°C', 'К'] },
  { group: 'Электричество', items: ['В', 'кВ', 'А', 'кА', 'Вт', 'кВт', 'МВт', 'ГВт', 'кВт·ч', 'МВт·ч', 'ГВт·ч'] },
  { group: 'Время',         items: ['сек', 'мин', 'ч'] },
];
const flatUnits = unitsCatalog.flatMap(g => g.items);

// ============ Стартовая (Главная) — набор виджетов разных типов ============
const homeWidgets = [
  { id: 1,  type: 'text',      w: 12, content: {
      title: 'Оперативная сводка',
      body: 'Все системы в норме. Смены работают в штатном режиме. Плановые работы на Участке_B — с 12:00 до 14:00.'
  }},
  { id: 2,  type: 'link-int',  w: 3, content: {
      icon: 'map',    label: 'Мнемосхемы ТП',           href: '#/schemes-page',   desc: '12 схем'
  }},
  { id: 3,  type: 'link-int',  w: 3, content: {
      icon: 'activity', label: 'Аналоговые параметры (ТИ)', href: '#/telemetry', desc: `${mockTelemetry.length} полей`
  }},
  { id: 4,  type: 'link-int',  w: 3, content: {
      icon: 'zap', label: 'Дискретные сигналы (ТС)',    href: '#/telesignals',    desc: '32 сигнала'
  }},
  { id: 5,  type: 'link-ext',  w: 3, content: {
      icon: 'external', label: 'Superset · корпоративный BI', href: 'https://superset.corp.local', desc: 'открыть в новой вкладке'
  }},
  { id: 6,  type: 'superset',  w: 8, content: { chartId: 'ch_daily_output' } },
  { id: 7,  type: 'superset',  w: 4, content: { chartId: 'ch_incidents' } },
  { id: 8,  type: 'chart',     w: 8, content: {
      title: 'Производственный график',
      description: 'обновлено 09:56 · протокол Modbus TCP · Линия_1',
      xAxis: { label: 'Время', unit: 'ч', min: 0, max: 24 },
      yAxis: { label: 'Объём / расход', unit: 'т/ч', min: 20, max: 200 },
      lines: [
        { id: 1, label: 'план',           color: '#8A96A3', style: 'dashed',  dataKey: 'plan',        source: { kind: 'dwh',       query: 'SELECT hour, plan FROM gold.production_plan WHERE date = current_date' } },
        { id: 2, label: 'факт',           color: '#C0392B', style: 'solid',   dataKey: 'fact',        source: { kind: 'telemetry', ref: 'line1-output' } },
        { id: 3, label: 'расход сырья 1', color: '#B26A00', style: 'dashdot', dataKey: 'consumption', source: { kind: 'telemetry', ref: 'raw-consumption-1' } },
        { id: 4, label: 'план изм.',      color: '#1F6FEB', style: 'dashed',  dataKey: 'planUpdated', source: { kind: 'manual' } },
      ],
      indicators: [
        { id: 1, kind: 'temp',     value: 62.28, unit: '°C',  label: 'температура', source: { kind: 'telemetry', ref: 'температура_подшипника' } },
        { id: 2, kind: 'pressure', value: 4.2,   unit: 'бар', label: 'давление',    source: { kind: 'telemetry', ref: 'давление_магистрали' } },
      ],
      deviations: { baseLineId: 1, thresholdPos: 3.0, thresholdNeg: -3.0, unit: '%', count: 3 },
  }},
  { id: 9,  type: 'scheme',    w: 4, content: { schemeName: 'Схема · Первый контур' } },
  { id: 10, type: 'values',    w: 6, content: {
      title: 'Суточная сводка производства',
      description: 'обновлено 09:56 · Modbus TCP',
      fields: [
        { id: 1, label: 'Суммарный выпуск',     value: 648.2, unit: 'т',    source: { kind: 'dwh',       query: 'SELECT SUM(output) FROM gold.production_hourly WHERE hour = now()' }, trend: '+3.1%' },
        { id: 2, label: 'Объём за сутки',       value: 12480, unit: 'т',    source: { kind: 'dwh',       query: 'SELECT SUM(volume) FROM gold.daily_summary' }, trend: '−2.4%' },
        { id: 3, label: 'КПД',                  value: 42.7,  unit: '%',    source: { kind: 'telemetry', ref: 'line1-efficiency' }, trend: '+0.4 п.п.' },
        { id: 4, label: 'Инциденты',            value: 3,     unit: 'шт',   source: { kind: 'manual' } },
      ]
  }},
  { id: 11, type: 'values',    w: 6, content: {
      title: 'Финансовые показатели',
      description: 'август 2026 · оперативные данные',
      fields: [
        { id: 1, label: 'Выручка',        value: 1240.5, unit: 'млн ₽', source: { kind: 'dwh',    query: 'SELECT SUM(revenue) FROM finance.monthly' }, trend: '+8.2%' },
        { id: 2, label: 'Себестоимость',  value: 892.1,  unit: 'млн ₽', source: { kind: 'dwh',    query: 'SELECT SUM(cost) FROM finance.monthly' }, trend: '+2.1%' },
        { id: 3, label: 'Маржинальность', value: 28.1,   unit: '%',     source: { kind: 'manual' }, trend: '+4.5 п.п.' },
      ]
  }},
  { id: 12, type: 'superset',  w: 12, content: { chartId: 'ch_kpi_efficiency' } },
];

Object.assign(window, {
  mockBlocks, mockProtocols, mockTelemetry, mockPages,
  mockProdChart,
  supersetCharts, homeWidgets,
  unitsCatalog, flatUnits,
  mockChartsDirectory, mockValuesDirectoryList,
});
