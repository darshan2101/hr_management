import { useEffect, useMemo, useState } from 'react';
import {
  getCountryInsights,
  getJobTitleInsights,
  getSummary
} from '../api/insights';

const jobTitles = [
  'Engineer',
  'Senior Engineer',
  'Staff Engineer',
  'Manager',
  'Director',
  'Designer',
  'Product Manager',
  'Analyst',
  'HR Specialist',
  'Accountant',
  'Sales Lead',
  'Support Engineer'
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function Insights() {
  const [countrySelection, setCountrySelection] = useState('');
  const [countryData, setCountryData] = useState(null);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState('');
  const [countryEmpty, setCountryEmpty] = useState(false);

  const [jobTitleSelection, setJobTitleSelection] = useState('Engineer');
  const [jobCountrySelection, setJobCountrySelection] = useState('');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [jobData, setJobData] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState('');
  const [jobEmpty, setJobEmpty] = useState(false);

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [countries, setCountries] = useState([]);
  const [countriesError, setCountriesError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      setSummaryLoading(true);
      setSummaryError('');
      try {
        const data = await getSummary();
        setSummary(data);
      } catch (err) {
        setSummaryError(err?.message || 'Unable to load salary distribution.');
      } finally {
        setSummaryLoading(false);
      }
    };

    loadSummary();
  }, []);

  const loadCountries = async () => {
    setCountriesError('');
    try {
      const response = await fetch('/api/employees/countries');
      if (!response.ok) {
        throw new Error('Unable to load countries.');
      }
      const data = await response.json();
      const list = data.countries || [];
      setCountries(list);
      if (!countrySelection && list.length) {
        setCountrySelection(list[0]);
      }
      if (!jobCountrySelection && list.length) {
        setJobCountrySelection(list[0]);
      }
    } catch (err) {
      setCountriesError(err?.message || 'Unable to load countries.');
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      setJobTitleFilter(jobTitleInput.trim());
    }, 300);

    return () => clearTimeout(handle);
  }, [jobTitleInput]);

  useEffect(() => {
    const loadCountryInsights = async () => {
      if (!countrySelection) {
        return;
      }
      setCountryLoading(true);
      setCountryError('');
      setCountryEmpty(false);
      try {
        const data = await getCountryInsights(countrySelection);
        setCountryData(data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setCountryEmpty(true);
          setCountryData(null);
        } else {
          setCountryError(err?.message || 'Unable to load country insights.');
        }
      } finally {
        setCountryLoading(false);
      }
    };

    loadCountryInsights();
  }, [countrySelection]);

  useEffect(() => {
    const loadJobInsights = async () => {
      if (!jobTitleSelection || !jobCountrySelection) {
        return;
      }
      setJobLoading(true);
      setJobError('');
      setJobEmpty(false);
      try {
        const data = await getJobTitleInsights({
          jobTitle: jobTitleSelection,
          country: jobCountrySelection
        });
        setJobData(data);
      } catch (err) {
        if (err?.response?.status === 404) {
          setJobEmpty(true);
          setJobData(null);
        } else {
          setJobError(err?.message || 'Unable to load job title insights.');
        }
      } finally {
        setJobLoading(false);
      }
    };

    loadJobInsights();
  }, [jobTitleSelection, jobCountrySelection]);

  const filteredJobTitles = useMemo(() => {
    if (!jobTitleFilter) {
      return jobTitles;
    }
    const lower = jobTitleFilter.toLowerCase();
    return jobTitles.filter((title) => title.toLowerCase().includes(lower));
  }, [jobTitleFilter]);

  const summaryBars = useMemo(() => {
    if (!summary?.salaryRanges) {
      return [];
    }
    const maxCount = Math.max(1, ...summary.salaryRanges.map((range) => range.count));
    return summary.salaryRanges.map((range) => ({
      ...range,
      percentage: Math.round((range.count / maxCount) * 100)
    }));
  }, [summary]);

  return (
    <section className="space-y-10">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryLoading && (
          <p className="text-sm text-ink-400">Loading summary…</p>
        )}
        {!summaryLoading && summaryError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {summaryError}
          </div>
        )}
        {!summaryLoading && !summaryError && summary && (
          <>
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Total Employees
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink-900">
                {summary.totalEmployees.toLocaleString('en-US')}
              </p>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Countries Count
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink-900">
                {summary.totalCountries.toLocaleString('en-US')}
              </p>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Unique Job Titles
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink-900">
                {summary.totalJobTitles.toLocaleString('en-US')}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-ink-900">Insights</h3>
          <p className="text-sm text-ink-500">
            Explore salary benchmarks by country and job title.
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Country Insights
              </p>
              <h4 className="text-lg font-semibold text-ink-900">Salary by Country</h4>
            </div>
            <select
              value={countrySelection}
              onChange={(event) => setCountrySelection(event.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {countriesError && (
            <p className="mt-4 text-sm text-red-600">{countriesError}</p>
          )}
          {countryLoading && (
            <p className="mt-6 text-sm text-ink-400">Loading country insights…</p>
          )}
          {!countryLoading && countryError && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {countryError}
            </div>
          )}
          {!countryLoading && !countryError && countryEmpty && (
            <p className="mt-6 text-sm text-ink-400">No data available.</p>
          )}
          {!countryLoading && !countryError && countryData && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                  Min Salary
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink-900">
                  {currencyFormatter.format(countryData.min)}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                  Max Salary
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink-900">
                  {currencyFormatter.format(countryData.max)}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                  Avg Salary
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink-900">
                  {currencyFormatter.format(countryData.avg)}
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                  Employee Count
                </p>
                <p className="mt-3 text-2xl font-semibold text-ink-900">
                  {countryData.count.toLocaleString('en-US')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
              Job Title Insights
            </p>
            <h4 className="text-lg font-semibold text-ink-900">Salary by Role</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Filter job titles"
              value={jobTitleInput}
              onChange={(event) => setJobTitleInput(event.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
            />
            <select
              value={jobTitleSelection}
              onChange={(event) => setJobTitleSelection(event.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none"
            >
              {filteredJobTitles.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
            <select
              value={jobCountrySelection}
              onChange={(event) => setJobCountrySelection(event.target.value)}
              className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none"
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {jobLoading && <p className="mt-6 text-sm text-ink-400">Loading role insights…</p>}
        {!jobLoading && jobError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {jobError}
          </div>
        )}
        {!jobLoading && !jobError && (jobEmpty || filteredJobTitles.length === 0) && (
          <p className="mt-6 text-sm text-ink-400">No data available.</p>
        )}
        {!jobLoading && !jobError && jobData && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Avg Salary
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink-900">
                {currencyFormatter.format(jobData.avg)}
              </p>
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                Employee Count
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink-900">
                {jobData.count.toLocaleString('en-US')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
            Salary Distribution
          </p>
          <h4 className="text-lg font-semibold text-ink-900">Ranges Overview</h4>
        </div>

        {summaryLoading && (
          <p className="mt-6 text-sm text-ink-400">Loading salary distribution…</p>
        )}
        {!summaryLoading && summaryError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {summaryError}
          </div>
        )}
        {!summaryLoading && !summaryError && summaryBars.length === 0 && (
          <p className="mt-6 text-sm text-ink-400">No salary distribution available.</p>
        )}
        {!summaryLoading && !summaryError && summaryBars.length > 0 && (
          <div className="mt-6 space-y-4">
            {summaryBars.map((range) => (
              <div key={range.range} className="grid grid-cols-[140px_1fr_60px] items-center gap-4">
                <p className="text-sm font-medium text-ink-600">{range.range}</p>
                <div className="h-3 rounded-full bg-ink-100">
                  <div
                    className="h-3 rounded-full bg-brand-500"
                    style={{ width: `${range.percentage}%` }}
                  />
                </div>
                <p className="text-sm text-ink-500">{range.count}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Insights;
