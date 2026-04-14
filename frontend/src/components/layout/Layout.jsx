import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

const titles = {
  '/dashboard': 'Executive Overview',
  '/employees': 'Employee Directory',
  '/insights': 'Salary Insights'
};

function Layout() {
  const location = useLocation();
  const title = titles[location.pathname] ?? 'HR Management';

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header title={title} />
        <main className="flex-1 px-10 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
