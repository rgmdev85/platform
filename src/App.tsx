// ⚠️  ЗАГЛУШКА-СКЕЛЕТ.
// Это точка входа для команды разработки. Реализуйте по спецификации из ../README.md
// и по референсам в ../Step 3 - Prototype.html + ../app/*.jsx.
//
// Рекомендуемая последовательность реализации — см. секцию «Приоритеты для разработки»
// в корневом README.md пакета.

import { Routes, Route, Navigate } from 'react-router-dom';

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ margin: 0 }}>{title}</h1>
      <p style={{ color: 'var(--ink-500)', marginTop: 8 }}>
        Экран пока не реализован. Референс: <code>../Step 3 - Prototype.html</code> и{' '}
        <code>../app/pages/</code>.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Placeholder title="Страница 1 · Дашборд" />} />
      <Route path="/pages" element={<Placeholder title="Управление страницами" />} />
      <Route path="/blocks" element={<Placeholder title="Блоки" />} />
      <Route path="/protocols" element={<Placeholder title="Протоколы" />} />
      <Route path="/telemetry" element={<Placeholder title="Телеизмерения" />} />
      <Route path="*" element={<Placeholder title="404" />} />
    </Routes>
  );
}
