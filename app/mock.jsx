// Mock data + helpers для прототипа

const mockBlocks = [
  { id: 1, name: "Блок_1", modbusId: "201071", createdAt: "2024-05-27 20:41:26", telemetryCount: 12 },
  { id: 2, name: "Блок_2", modbusId: "201090", createdAt: "2024-05-27 20:47:04", telemetryCount: 8 },
  { id: 3, name: "Блок_3", modbusId: "201101", createdAt: "2024-05-28 13:20:33", telemetryCount: 15 },
  { id: 4, name: "Блок_4", modbusId: "201115", createdAt: "2024-06-14 08:12:44", telemetryCount: 10 },
  { id: 5, name: "Блок_5", modbusId: "201133", createdAt: "2024-07-02 15:32:18", telemetryCount: 6 },
];

const mockProtocols = [
  { id: 1, name: "мэк-104-1",           protocol: "МЭК-104",       stationAddr: "12345", port: 8700,  ipServer: "127.0.0.1",      backupIp: "127.0.0.2" },
  { id: 2, name: "МЭК-104 Эмулятор-2",  protocol: "МЭК-104",       stationAddr: "193",   port: 3404,  ipServer: "10.77.116.165",  backupIp: "—" },
  { id: 3, name: "Modbus-31",           protocol: "Modbus TCP",    stationAddr: "150",   port: 500,   ipServer: "10.77.116.165",  backupIp: "—" },
  { id: 4, name: "Мэк-104-2",           protocol: "МЭК-104",       stationAddr: "87360", port: 45634, ipServer: "192.164.1.1",    backupIp: "—" },
  { id: 5, name: "МЭК-104-Эмулятор",    protocol: "МЭК-104",       stationAddr: "153",   port: 3404,  ipServer: "10.77.116.02",   backupIp: "10.77.116.03" },
  { id: 6, name: "МЭК-104-тест",        protocol: "МЭК-104",       stationAddr: "151",   port: 8196,  ipServer: "10.77.116.02",   backupIp: "—" },
];

const mockTelemetry = Array.from({ length: 47 }, (_, i) => {
  const blocks = ["Блок_1", "Блок_2", "Блок_3", "Блок_4", "—"];
  const names = ["элемент 133 Uc", "элемент 220", "элемент 135 P", "элемент 232 Ub", "b1-температура", "b2-температура", "b3-температура", "b3-generation", "элемент 135-Q", "элемент 222", "элемент 232 Q", "элемент 231", "b4-generation", "элемент 232 g", "b4-temperature"];
  const t = new Date(2026, 7, 24, 9, 59 - (i * 2) % 40, 30 - i % 30);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    id: i + 1,
    time: `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`,
    block: blocks[i % 5],
    name: names[i % names.length] + (i % 5 === 0 ? '' : ''),
    signalType: "Float",
    quality: i === 3 || i === 17 || i === 31 ? 0 : 1,
    value: (Math.sin(i * 0.7) * 30 + 100 + (i * 3.7) % 60).toFixed(2),
  };
});

const mockPages = [
  { id: 1, name: "Страница 1", author: "Пётр Петрович", createdAt: "2024-05-27 20:41:26", widgets: 3, status: "published" },
  { id: 2, name: "Диспетчерский пульт УДГК-1", author: "Пётр Петрович", createdAt: "2024-08-12 10:22:14", widgets: 5, status: "published" },
  { id: 3, name: "Аварийный контур", author: "Иван Смирнов", createdAt: "2025-01-08 08:04:00", widgets: 2, status: "draft" },
  { id: 4, name: "Отчёт по выработке (Q2 2026)", author: "Пётр Петрович", createdAt: "2026-04-01 12:00:00", widgets: 7, status: "published" },
];

// Series для графика ПБР 24 часа (шаг 30 мин = 48 точек)
function generatePBRSeries() {
  const pts = 48;
  const series = { hour: [], kztk: [], kz2: [], kzs: [], fact: [], plan: [] };
  for (let i = 0; i < pts; i++) {
    const h = i / 2; // 0..24
    series.hour.push(h);
    // baseline рабочего дня: спад к утру, ramp с 8, пик 10-16, спад к 22
    let base;
    if (h < 8) base = 80 + Math.sin(h * 0.4) * 4;
    else if (h < 10) base = 80 + (h - 8) * 33;
    else if (h < 16) base = 146 + Math.sin((h - 10) * 0.5) * 4;
    else if (h < 22) base = 146 + (h - 16) * 10;
    else base = 80 + Math.sin(h * 0.4) * 3;

    // ПБР — гладкая плановая
    const plan = base + Math.sin(h * 0.3) * 2;
    series.plan.push(plan);

    // Факт — реальные значения с шумом
    if (h < 13) {
      const noise = (Math.random() - 0.5) * 3;
      series.fact.push(base + noise);
    } else {
      series.fact.push(null); // ещё нет фактических данных после текущего часа
    }

    // Лимитные линии (константы)
    series.kztk.push(165);
    series.kz2.push(155);
    series.kzs.push(135);
  }
  return series;
}

// Трёхминутная выработка (60 точек по 3 минуты = 180 мин = 3 часа последних)
function generateThreeMinData() {
  const arr = [];
  for (let i = 0; i < 60; i++) {
    // Значения в коридоре 145–165 (норма)
    const v = 150 + Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 4;
    arr.push(v);
  }
  // Пара выбросов
  arr[15] = 172;
  arr[42] = 138;
  return arr;
}

// Блоки ГОУ — статусы блоков за час (60 точек по 1 мин)
function generateGOUData() {
  const arr = [];
  for (let i = 0; i < 60; i++) {
    arr.push({ status: (i === 22 || i === 47) ? 'alarm' : 'ok', v: 155 + Math.sin(i * 0.2) * 5 });
  }
  return arr;
}

const mockPBR = generatePBRSeries();
const mockThreeMin = generateThreeMinData();
const mockGOU = generateGOUData();

Object.assign(window, {
  mockBlocks, mockProtocols, mockTelemetry, mockPages,
  mockPBR, mockThreeMin, mockGOU,
});
