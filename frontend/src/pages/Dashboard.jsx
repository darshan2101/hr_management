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

  return (
    <section className="space-y-6">
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
    </section>
  );
}

export default Dashboard;
