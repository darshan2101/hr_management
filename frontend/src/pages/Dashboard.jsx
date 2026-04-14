import { useEffect, useState } from 'react';
import { getSummary } from '../api/insights';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const cards = [
  { key: 'totalEmployees', label: 'Total Employees', type: 'number' },
  { key: 'avgSalary', label: 'Avg Salary', type: 'currency' },
  { key: 'maxSalary', label: 'Highest Salary', type: 'currency' },
  { key: 'minSalary', label: 'Lowest Salary', type: 'currency' },
  { key: 'totalCountries', label: 'Countries', type: 'number' },
  { key: 'totalJobTitles', label: 'Job Titles', type: 'number' }
];

const formatDate = (value) =>
  value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

const buildChart = (items, labelKey, valueKey) => {
  const maxValue = Math.max(1, ...items.map((item) => item[valueKey] || 0));
  return items.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
    height: Math.round(((item[valueKey] || 0) / maxValue) * 100)
  }));
};

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadSummary = async () => {
      try {
        const data = await getSummary();
        if (isActive) {
          setSummary(data);
          setError('');
        }
      } catch (err) {
        if (isActive) {
          setError(err?.message || 'Unable to load summary.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return <p className="text-sm text-ink-400">Loading summary…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const salaryBars = buildChart(summary.salaryRanges || [], 'range', 'count');
  const countryBars = buildChart(summary.topCountries || [], 'country', 'count');

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-ink-100 bg-white px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
          Welcome back, HR Manager
        </p>
        <p className="mt-2 text-lg font-semibold text-ink-900">{formatDate(new Date())}</p>
      </div>
      <h3 className="text-xl font-semibold text-ink-900">Dashboard</h3>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const rawValue = summary?.[card.key] ?? 0;
          const value =
            card.type === 'currency' ? formatter.format(rawValue) : rawValue.toLocaleString('en-US');

          return (
            <div
              key={card.key}
              className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                {card.label}
              </p>
              <p className="mt-4 text-3xl font-semibold text-ink-900">{value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Salary Distribution
              </p>
              <h4 className="text-lg font-semibold text-ink-900">Employees by Range</h4>
            </div>
          </div>
          <div className="mt-6 h-56">
            <svg viewBox="0 0 500 220" className="h-full w-full">
              {salaryBars.map((bar, index) => {
                const barWidth = 60;
                const gap = 20;
                const x = 40 + index * (barWidth + gap);
                const height = Math.max(4, (bar.height / 100) * 140);
                const y = 180 - height;
                return (
                  <g key={bar.label}>
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-ink-500 text-[10px]"
                    >
                      {bar.value}
                    </text>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="8"
                      className="fill-brand-500"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={200}
                      textAnchor="middle"
                      className="fill-ink-500 text-[10px]"
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              })}
              <line x1="20" y1="180" x2="480" y2="180" className="stroke-ink-200" />
            </svg>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Top Countries
              </p>
              <h4 className="text-lg font-semibold text-ink-900">Employees by Location</h4>
            </div>
          </div>
          <div className="mt-6 h-56">
            <svg viewBox="0 0 500 220" className="h-full w-full">
              {countryBars.map((bar, index) => {
                const barWidth = 80;
                const gap = 30;
                const x = 60 + index * (barWidth + gap);
                const height = Math.max(4, (bar.height / 100) * 140);
                const y = 180 - height;
                return (
                  <g key={bar.label}>
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      className="fill-ink-500 text-[10px]"
                    >
                      {bar.value}
                    </text>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="8"
                      className="fill-brand-400"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={200}
                      textAnchor="middle"
                      className="fill-ink-500 text-[10px]"
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              })}
              <line x1="30" y1="180" x2="480" y2="180" className="stroke-ink-200" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
