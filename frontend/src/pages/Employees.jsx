import { useEffect, useMemo, useState } from 'react';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee
} from '../api/employees';

const PAGE_SIZE = 20;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const formatDate = (value) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const emptyForm = {
  full_name: '',
  job_title: '',
  department: '',
  country: '',
  salary: '',
  currency: 'USD',
  email: '',
  hire_date: ''
};

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [countries, setCountries] = useState([]);
  const [countriesError, setCountriesError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(handle);
  }, [searchInput]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const sortedCountries = useMemo(() => {
    if (countries.length) {
      return countries;
    }
    const unique = new Set(employees.map((emp) => emp.country).filter(Boolean));
    return Array.from(unique).sort();
  }, [countries, employees]);

  const loadCountries = async () => {
    setCountriesError('');
    try {
      const response = await fetch('/api/employees/countries');
      if (!response.ok) {
        throw new Error('Unable to load countries.');
      }
      const data = await response.json();
      setCountries(data.countries || []);
    } catch (err) {
      setCountriesError(err?.message || 'Unable to load countries.');
    }
  };

  const fetchEmployees = async (nextPage = page) => {
    setIsLoading(true);
    setError('');
    try {
      const params = {
        page: nextPage,
        limit: PAGE_SIZE
      };
      if (search) {
        params.search = search;
      }
      if (countryFilter !== 'all') {
        params.country = countryFilter;
      }
      if (sortBy) {
        params.sort_by = sortBy;
        params.sort_order = sortOrder;
      }
      const result = await getEmployees(params);
      setEmployees(result.data || []);
      setTotal(result.total || 0);
      setPage(result.page || nextPage);
    } catch (err) {
      setError(err?.message || 'Unable to load employees.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [search, countryFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      return;
    }
    fetchEmployees(page);
  }, [page, totalPages]);

  useEffect(() => {
    loadCountries();
  }, []);

  const openAddModal = () => {
    setEditingEmployee(null);
    setFormValues(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormValues({
      full_name: employee.full_name ?? '',
      job_title: employee.job_title ?? '',
      department: employee.department ?? '',
      country: employee.country ?? '',
      salary: employee.salary ?? '',
      currency: employee.currency ?? 'USD',
      email: employee.email ?? '',
      hire_date: employee.hire_date ?? ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      full_name: formValues.full_name.trim(),
      job_title: formValues.job_title.trim(),
      department: formValues.department.trim() || null,
      country: formValues.country.trim(),
      salary: Number(formValues.salary),
      currency: formValues.currency.trim() || 'USD',
      email: formValues.email.trim() || null,
      hire_date: formValues.hire_date || null
    };

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, payload);
      } else {
        await createEmployee(payload);
      }
      closeModal();
      loadCountries();
      fetchEmployees(1);
    } catch (err) {
      setError(err?.message || 'Unable to save employee.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteEmployee(deleteTarget.id);
      closeDeleteModal();
      loadCountries();
      fetchEmployees(1);
    } catch (err) {
      setError(err?.message || 'Unable to delete employee.');
    }
  };

  const handleSort = (column) => {
    setPage(1);
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortBy(column);
    setSortOrder('asc');
  };

  const sortIndicator = (column) => {
    if (sortBy !== column) {
      return '';
    }
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-ink-900">Employees</h3>
          <p className="text-sm text-ink-500">Manage the HR employee directory.</p>
        </div>
        <button
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          onClick={openAddModal}
          type="button"
        >
          Add Employee
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Search by name or job title"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full max-w-md rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none"
        />
        <select
          value={countryFilter}
          onChange={(event) => {
            setCountryFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm text-ink-700 focus:border-brand-400 focus:outline-none"
        >
          <option value="all">All Countries</option>
          {sortedCountries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {countriesError && (
          <span className="text-xs text-red-600">{countriesError}</span>
        )}
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-4">
        {isLoading && <p className="text-sm text-ink-400">Loading employees…</p>}
        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-ink-400">
                <tr>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('full_name')}
                      className="text-xs uppercase tracking-wider text-ink-400 hover:text-ink-600"
                    >
                      Full Name{sortIndicator('full_name')}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('job_title')}
                      className="text-xs uppercase tracking-wider text-ink-400 hover:text-ink-600"
                    >
                      Job Title{sortIndicator('job_title')}
                    </button>
                  </th>
                  <th className="px-3 py-3">Department</th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('country')}
                      className="text-xs uppercase tracking-wider text-ink-400 hover:text-ink-600"
                    >
                      Country{sortIndicator('country')}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort('salary')}
                      className="text-xs uppercase tracking-wider text-ink-400 hover:text-ink-600"
                    >
                      Salary{sortIndicator('salary')}
                    </button>
                  </th>
                  <th className="px-3 py-3">Hire Date</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="text-ink-700">
                    <td className="px-3 py-4 font-medium text-ink-900">{employee.full_name}</td>
                    <td className="px-3 py-4">{employee.job_title}</td>
                    <td className="px-3 py-4">{employee.department || '—'}</td>
                    <td className="px-3 py-4">{employee.country}</td>
                    <td className="px-3 py-4">
                      {currencyFormatter.format(employee.salary || 0)}
                    </td>
                    <td className="px-3 py-4">{formatDate(employee.hire_date)}</td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(employee)}
                          className="rounded-lg border border-ink-200 px-2 py-1 text-xs text-ink-600 transition hover:border-brand-300 hover:text-brand-700"
                          aria-label="Edit employee"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(employee)}
                          className="rounded-lg border border-ink-200 px-2 py-1 text-xs text-ink-600 transition hover:border-red-200 hover:text-red-600"
                          aria-label="Delete employee"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-ink-400">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm text-ink-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-ink-200 px-4 py-2 text-sm text-ink-600 transition hover:border-brand-300 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-ink-900">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h4>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-ink-200 px-3 py-1 text-sm text-ink-600 hover:border-ink-300"
              >
                Close
              </button>
            </div>
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="text-sm text-ink-600">
                Full Name *
                <input
                  required
                  name="full_name"
                  value={formValues.full_name}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Job Title *
                <input
                  required
                  name="job_title"
                  value={formValues.job_title}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Department
                <input
                  name="department"
                  value={formValues.department}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Country *
                <input
                  required
                  name="country"
                  value={formValues.country}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Salary *
                <input
                  required
                  name="salary"
                  type="number"
                  min="0"
                  value={formValues.salary}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Currency
                <input
                  name="currency"
                  value={formValues.currency}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Email
                <input
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-ink-600">
                Hire Date
                <input
                  name="hire_date"
                  type="date"
                  value={formValues.hire_date}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-ink-200 px-3 py-2 text-sm"
                />
              </label>
              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-ink-200 px-4 py-2 text-sm text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-ink-900">Confirm Deletion</h4>
            <p className="mt-2 text-sm text-ink-600">
              Are you sure you want to delete {deleteTarget.full_name}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-xl border border-ink-200 px-4 py-2 text-sm text-ink-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Employees;
