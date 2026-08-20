import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ChevronRight, Home, Shield } from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();

  // Generate breadcrumb items
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
    return { label, url };
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Breadcrumbs Sub-bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-8 py-2 text-xs">
          <nav className="flex items-center gap-1.5 text-slate-400">
            <Link to="/" className="flex items-center gap-1 hover:text-slate-200 transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            {breadcrumbs.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.url}>
                {idx === breadcrumbs.length - 1 ? (
                  <span className="font-semibold text-amber-400">{crumb.label}</span>
                ) : (
                  <>
                    <Link to={crumb.url} className="hover:text-slate-200 transition-colors">
                      {crumb.label}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </>
                )}
              </React.Fragment>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">System Status:</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Operational (Ready for Demo)
            </span>
          </div>
        </div>

        {/* Scrollable Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
