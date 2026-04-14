import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Employees', to: '/employees' },
  { label: 'Insights', to: '/insights' }
];

function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-ink-100 bg-white px-6 py-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-400">HR Suite</p>
        <h1 className="text-xl font-semibold text-ink-900">People Console</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-100 text-brand-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-ink-100 bg-ink-50 p-4 text-xs text-ink-500">
        Audit-ready HR workflows
      </div>
    </aside>
  );
}

export default Sidebar;
